# Hostel Room Status
A simple, mobile-friendly web app that lets people know whether I'm sleeping, busy, or available, without having to knock and find out the hard way. 
And you don't have to manually open the webpage. The status page is written in an NFC Tag and scanning it redirects the phone to the status webpage.
I can change status using the admin page. 

## Why I Built This
In a hostel, people often don't know whether it's a good time to knock on someone's door. I wanted a simple way to communicate my availability without needing to answer messages or put up a handwritten sign.
The idea was to create a small web app that could be accessed by scanning an NFC tag placed on my room door.

## Features
- **Public status page:** Displays my current room status.
- **Private admin panel:** Allows me to update the status using password-protected controls.
- **Persistent status storage:** Uses Cloudflare KV to store the current status.
- **Session-based login:** Uses a session cookie to keep the admin logged in.
- **Mobile-friendly interface:** Designed to be easy to read on a phone.
- **NFC integration:** A permanent link can be stored on an NFC tag, so visitors can check the status without needing a new link each time.

## Technologies Used
- JavaScript
- Cloudflare Workers
- Cloudflare KV
- Wrangler CLI
- Node.js and npm
- Git and GitHub
- HTML and CSS
- NFC tags

## How It Works
1. An NFC tag on the room door opens the public status page.
2. The page retrieves the current status from Cloudflare KV.
3. I log in to the private admin panel to change my status.
4. The updated status becomes visible on the public page.

## Development
I started with Cloudflare's existing Hello World Worker starter template and customized it to build this project. I implemented the room status logic, KV-based storage, password-protected admin controls, session handling, and the user interface.
The starter template provided the initial project structure; the room-status functionality was developed for this use case.

## Deployment
The application is deployed using Cloudflare Workers.
Public status page: https://curly-wildflower-1b8d.roomstatus-mnit.workers.dev/status

## Future Improvements
- Add logout functionality to the admin panel.
- Improve session security and error handling.
- Add a more convenient home-screen shortcut for the admin page.
