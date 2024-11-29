from django.shortcuts import render, redirect
from django.http import JsonResponse
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .utils import *
from api.models import Room
from .models import Vote
from .serializers import VoteSerializer
from music_controller.settings import CLIENT_ID, CLIENT_SECRET, REDIRECT_URI

class AuthURL(APIView):
    def get(self, request, fornat=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)
    

class CurrentSong(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.song = {
            'title': "No song playing",
            'artist': "N/A",
            'duration': 0,
            'time': 0,
            'image_url': "https://media.giphy.com/media/3o6Zt481isNVuQI1l6/giphy.gif",
            'is_playing': False,
            'votes': 0,
            'votes_required': 0,
            'id': None
        }
    
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        
        if room.exists():
            room = room[0]
        else:
            return Response(self.song, status=status.HTTP_404_NOT_FOUND)  # Return default if no room
        
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)
        
        if 'error' in response or 'item' not in response:
            return Response(self.song, status=status.HTTP_200_OK)  # Return default if no song playing

        # If there's a song, populate with real data
        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        # Get artist names
        artists_string = ", ".join(artist.get('name') for artist in item.get('artists'))

         # Serialize votes
        votes = Vote.objects.filter(room=room, song_id=song_id)
        serialized_votes = VoteSerializer(votes, many=True).data

        # Set song details
        self.song.update({
            'title': item.get('name'),
            'artist': artists_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': len(serialized_votes),
            'votes_required': room.votes_to_skip,
            'id': song_id
        })

        self.update_room_song(room, song_id)

        return Response(self.song, status=status.HTTP_200_OK)
    
    def update_room_song(self, room, song_id):
        current_song = room.current_song
        if self.song['votes'] >= self.song['votes_required']:
            votes = Vote.objects.filter(room=room).delete()
            skip_song(room.host)

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()    # FOR LATER CHECK WHEN PLAYLIST IMPLEMENTED
            

    
class PauseSong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)
    
class PlaySong(APIView):
    def put(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)
    

class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)

        if self.request.session.session_key == room.host:
            votes.delete()
            skip_song(room.host)
        else:
            vote = Vote(user=self.request.session.session_key,
                        room=room, song_id=room.current_song)
            vote.save()

        return Response({}, status.HTTP_204_NO_CONTENT)
    

class Playlist(APIView):
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self.playlist = []
    
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        
        if room.exists():
            room = room[0]
        else:
            return Response(self.playlist, status=status.HTTP_404_NOT_FOUND)  # Return default if no room
        
        response = queue(room.host)
        
        if 'error' in response or 'queue' not in response:
            return Response(self.playlist, status=status.HTTP_200_OK)  # Return default if no queue

        # Initialize the list of songs
        songs_list = []

        # Iterate over each song in the queue
        for item in response.get('queue', []):
            duration = item.get('duration_ms')
            album_cover = item.get('album', {}).get('images', [{}])[0].get('url')
            song_id = item.get('id')

            # Get artist names
            artists_string = ", ".join(artist.get('name') for artist in item.get('artists', []))

            # Add song details to the list
            songs_list.append({
                'title': item.get('name'),
                'artist': artists_string,
                'duration': duration,
                'image_url': album_cover,
                'id': song_id
            })

        # Update the song queue information
        self.playlist = songs_list  # Assuming `self.song_queue` is defined to store the list of dictionaries

        self.update_room_queue(room, self.playlist)

        return Response(self.playlist, status=status.HTTP_200_OK)
    
    def update_room_queue(self, room, songs_list):
        current_queue = room.queue
        if current_queue != songs_list:
            room.queue = songs_list
            room.save(update_fields=['queue'])


class Search(APIView):
    def get(self, request):
        query = request.GET.get('q', '')
        session_id = request.session.session_key
        if query:
            print(f"Query>>>> {query}")
            search_results = search_song(session_id, query)
            print(f"Query>>>> {search_results}")
            return JsonResponse(search_results)
        return JsonResponse({'Error': 'No query provided'}, status=400)


class AddSong(APIView):
    def post(self, request, format=None):
        #WRITE SOMETHING HERE
        pass