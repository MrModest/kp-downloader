# author: https://t.me/riemannb
import requests
import time
import os
import json
import sys

from datetime import datetime
from pprint import pformat

class KP_API:
    CLIENT_ID = "windows"
    CLIENT_SECRET = "2b5124ku4l2qc6gahnjr07qpj65fvrl4"

    def get_activation_code(self):
        return requests.post('https://api.service-kp.com/oauth2/device',
                             params={'grant_type': 'device_code',
                                     'client_id':self.CLIENT_ID,
                                     'client_secret': self.CLIENT_SECRET}).json()

    def add_token_info(self, token_info):
        self.TOKEN = token_info.get('access_token', '')
        self.REFRESH_TOKEN = token_info.get('refresh_token', '')
        self.HEADERS = {'Authorization': 'Bearer %s' % self.TOKEN}

    def get_tocken(self, code_info):
        code = code_info.get('code')
        token_info = {}
        for i in range(60):
            time.sleep(code_info.get('interval', 5))
            r = requests.post('https://api.service-kp.com/oauth2/device', params={'grant_type': 'device_token',
                                                                                  'client_id': self.CLIENT_ID,
                                                                                  'client_secret': self.CLIENT_SECRET,
                                                                                  'code': code})
            if r.status_code == 200:
                token_info = r.json()
                self.update_token_info(token_info)
                self.save_token(token_info)
                break

            else:
                print('Waiting for an activation. Code = %d' % r.status_code)
        return token_info
    
    def refresh_tocken(self, refresh_tocken):
        token_info = {}
        r = requests.post('https://api.service-kp.com/oauth2/token', params={'grant_type': 'refresh_token',
                                                                             'client_id': self.CLIENT_ID,
                                                                             'client_secret': self.CLIENT_SECRET,
                                                                             'refresh_token': refresh_tocken})
        if r.status_code == 200:
            token_info = r.json()
            self.update_token_info(token_info)
            self.save_token(token_info)
        else:
            print('Got error when reshreshin token. refresh_token={} | status_code={} | err={}'.format(refresh_tocken, r.status_code, r.reason))
            
        return token_info

    def save_token(self, info, fn=None):
        if not fn:
            fn = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'activation.json')
        j = json.dumps(info, sort_keys=True, indent=4, separators=(',', ': '))
        open(fn, 'w+').write(j)

    def update_token_info(self, token_info):
        token_info['expiration_timestamp'] = int(time.time()) + token_info.get('expires_in', 60*60*24)
        token_info['expiration_timestamp_str'] = datetime.fromtimestamp(
            token_info['expiration_timestamp']
        ).strftime('%Y-%m-%d %H:%M:%S')
        self.TOKEN = token_info.get('access_token', '')
        self.REFRESH_TOKEN = token_info.get('refresh_token', '')
        self.HEADERS = {'Authorization': 'Bearer %s' % self.TOKEN}

    def update_device_info(self, info):
        return requests.post('https://api.service-kp.com/v1/device/notify',
                             data={'title': info.get('title', 'TEST CLIENT'),
                                   'hardware': info.get('hardware', 'MAC OS'),
                                   'software': info.get('software', 'Python')},
                             headers=self.HEADERS).json()


def run_activation():
    api = KP_API()
    code = api.get_activation_code()
    print("Code: %s" % code.get("user_code"))
    token_info = api.get_tocken(code)
    api.update_device_info({})
    print("Access token: %s" % token_info.get("access_token"))
    print("tokens are in activation.json")
    
def run_refresh():
    api = KP_API()
    fn = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'activation.json')
    token_info = json.loads(open(fn, 'r').read())
    print(token_info)
    api.refresh_tocken(token_info.get("refresh_token"))
    
def main():
    #run_activation()
    run_refresh()
   
    
main()    
    