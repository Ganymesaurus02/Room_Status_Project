# Hostel Room Status
A simple, mobile-friendly web app that lets people know whether I'm sleeping, busy, or available, without having to knock and find out the hard way. 
And you don't have to manually open the webpage. The status page is written in an NFC Tag and scanning it redirects the phone to the status webpage.
I can change status using the admin page. 

## Why I Built This
In a hostel, people often don't know whether it's a good time to knock on someone's door. I wanted a simple way to communicate my availability without needing to answer messages or put up a handwritten sign.
The idea was to create a small web app that could be accessed by scanning an NFC tag placed on my room door.

## Features
**Room Status Display:** Shows whether the room occupant is Sleeping, Busy, or Awake.
**Cloudflare Workers:** Hosts the website online.
**Cloudflare KV Storage:** Stores the current room status and login sessions.
**Password-Protected Admin Page:** Allows only authenticated users to change the room status.
**Session-Based Authentication:** Maintains login sessions using unique session tokens.
**Secure Session Cookies:** Uses HttpOnly, SameSite=Strict, and the Secure flag over HTTPS.
**Logout Functionality:** Invalidates the active session and expires the session cookie.
**Login Rate Limiting:** Tracks failed login attempts and temporarily blocks repeated attempts.
**Responsive UI:** Provides a mobile-friendly interface for the public status page and admin panel.
**NFC Compatibility:** Can be accessed through an NFC tag placed outside the hostel room.
**Git and GitHub:** Tracks code changes and maintains an online project repository.
**Deployment with Wrangler:** Deploys updates to Cloudflare Workers from the command line.

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
- Add a more convenient home-screen shortcut for the admin page.
