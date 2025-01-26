from aiohttp import web
import json
from datetime import datetime
import urllib.parse

async def handle_request(request):
    with open("index.html") as content_file:
        return web.Response(body=content_file.read(), content_type='text/html')

app = web.Application()
app.router.add_get('/sandbox', handle_request)
app.add_routes([web.static('/', './')])

if __name__ == '__main__':
    web.run_app(app, host='0.0.0.0', port=5132)
