"""
Simple Home Inspection On-Demand Web App

This web application is implemented using only Python's standard library so it
can run in environments without external dependencies.  It serves a basic
landing page, user registration and authentication for two different roles
(Clients and Inspectors) and allows clients to book home inspections.  The
application uses SQLite for persistent storage and a simple in‑memory
dictionary for session management.

To run the development server on your local machine, execute:

    python3 app.py

By default the server listens on http://localhost:8000.  Feel free to change
the port at the bottom of this file if necessary.

This is not a production‑ready implementation—it is intended purely for
demonstration and local testing.  In a real application you should use
frameworks like Flask or Django, incorporate CSRF protection, password
hashing and secure session handling.
"""

from wsgiref.simple_server import make_server
from wsgiref.util import setup_testing_defaults
import sqlite3
import os
import urllib.parse
import uuid
import http.cookies
import datetime


DB_PATH = os.path.join(os.path.dirname(__file__), "data.sqlite3")


def init_db():
    """Initialize the database with required tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('client','inspector'))
        )
        """
    )
    cur.execute(
        """
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            client_id INTEGER NOT NULL,
            inspector_id INTEGER,
            date TEXT NOT NULL,
            time TEXT NOT NULL,
            address TEXT NOT NULL,
            details TEXT,
            status TEXT NOT NULL DEFAULT 'pending',
            FOREIGN KEY (client_id) REFERENCES users(id),
            FOREIGN KEY (inspector_id) REFERENCES users(id)
        )
        """
    )
    conn.commit()
    conn.close()


# In‑memory session store mapping session_id -> user_id
SESSIONS = {}


def parse_cookies(environ):
    """Return a SimpleCookie parsed from the request's Cookie header."""
    cookies = http.cookies.SimpleCookie()
    if 'HTTP_COOKIE' in environ:
        cookies.load(environ['HTTP_COOKIE'])
    return cookies


def redirect(location):
    """Return a WSGI response that redirects to a new location."""
    status = '302 Found'
    headers = [('Location', location)]
    return status, headers, [b'']


def render_template(template_name, context=None):
    """Render an HTML template from the templates directory.

    Templates live in homeinspection_app/templates.  The function reads the
    specified template file and substitutes variables using Python's
    str.format() method.  All keys in the provided `context` dictionary
    become available as format variables.  Missing variables are replaced
    with empty strings.
    """
    if context is None:
        context = {}
    templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
    path = os.path.join(templates_dir, template_name)
    with open(path, 'r', encoding='utf-8') as f:
        template = f.read()
    try:
        return template.format(**context)
    except KeyError as e:
        # Replace missing keys with empty string
        missing_key = e.args[0]
        context[missing_key] = ''
        return template.format(**context)


def get_post_data(environ):
    """Parse URL‑encoded POST data from the WSGI environ and return a dict."""
    try:
        request_body_size = int(environ.get('CONTENT_LENGTH', 0))
    except (ValueError, TypeError):
        request_body_size = 0
    request_body = environ['wsgi.input'].read(request_body_size)
    post_data = urllib.parse.parse_qs(request_body.decode('utf-8'))
    # Flatten single value lists
    return {k: v[0] if isinstance(v, list) and v else '' for k, v in post_data.items()}


def get_current_user(environ):
    """Return the current logged in user as a dict or None if not logged in."""
    cookies = parse_cookies(environ)
    session_id = cookies.get('session_id')
    if session_id:
        session_token = session_id.value
        user_id = SESSIONS.get(session_token)
        if user_id:
            # Fetch user from db
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            cur.execute("SELECT id, name, email, role FROM users WHERE id = ?", (user_id,))
            row = cur.fetchone()
            conn.close()
            if row:
                return {'id': row[0], 'name': row[1], 'email': row[2], 'role': row[3]}
    return None


def handle_home(environ):
    """Handle requests to the root path (landing page)."""
    user = get_current_user(environ)
    # Build navigation links and hero buttons based on login state
    if user:
        nav_links = (
            '<li class="nav-item"><a href="/dashboard" class="nav-link">Dashboard</a></li>'
            '<li class="nav-item"><a href="/logout" class="nav-link">Logout</a></li>'
        )
        hero_buttons = '<a href="/dashboard" class="btn btn-primary btn-lg m-2">Go to Dashboard</a>'
    else:
        nav_links = (
            '<li class="nav-item"><a href="/login" class="nav-link">Login</a></li>'
            '<li class="nav-item"><a href="/register" class="nav-link">Register</a></li>'
        )
        hero_buttons = (
            '<a href="/register" class="btn btn-primary btn-lg m-2">Get Started</a>'
            '<a href="/login" class="btn btn-outline-light btn-lg m-2">Log In</a>'
        )
    context = {
        'nav_links': nav_links,
        'hero_buttons': hero_buttons,
        'year': datetime.datetime.now().year
    }
    status = '200 OK'
    headers = [('Content-Type', 'text/html; charset=utf-8')]
    body = render_template('index.html', context)
    return status, headers, [body.encode('utf-8')]


def handle_register(environ):
    """Display registration form or create a new user on POST."""
    if environ['REQUEST_METHOD'] == 'GET':
        # Show registration form
        html = render_template('register.html', {'error_block': ''})
        return '200 OK', [('Content-Type', 'text/html; charset=utf-8')], [html.encode('utf-8')]
    else:
        # Process registration
        data = get_post_data(environ)
        name = data.get('name', '').strip()
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        role = data.get('role', '').strip()
        # Basic validation
        error = None
        if not name or not email or not password or role not in ('client', 'inspector'):
            error = 'Please fill in all fields correctly.'
        else:
            # Insert into DB
            conn = sqlite3.connect(DB_PATH)
            cur = conn.cursor()
            try:
                cur.execute(
                    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
                    (name, email, password, role)
                )
                conn.commit()
            except sqlite3.IntegrityError:
                error = 'Email already registered.'
            finally:
                conn.close()
        if error:
            # redisplay form with error
            error_html = f'<div class="alert alert-danger">{error}</div>'
            body = render_template('register.html', {'error_block': error_html})
            return '200 OK', [('Content-Type', 'text/html; charset=utf-8')], [body.encode('utf-8')]
        else:
            # redirect to login
            return redirect('/login')


def handle_login(environ):
    """Display login form or authenticate on POST."""
    if environ['REQUEST_METHOD'] == 'GET':
        html = render_template('login.html', {'error_block': ''})
        return '200 OK', [('Content-Type', 'text/html; charset=utf-8')], [html.encode('utf-8')]
    else:
        data = get_post_data(environ)
        email = data.get('email', '').strip().lower()
        password = data.get('password', '').strip()
        # Validate credentials
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute("SELECT id, password FROM users WHERE email = ?", (email,))
        row = cur.fetchone()
        conn.close()
        error = None
        if row is None or row[1] != password:
            error = 'Invalid email or password.'
        if error:
            error_html = f'<div class="alert alert-danger">{error}</div>'
            body = render_template('login.html', {'error_block': error_html})
            return '200 OK', [('Content-Type', 'text/html; charset=utf-8')], [body.encode('utf-8')]
        else:
            # Set session cookie
            user_id = row[0]
            session_token = str(uuid.uuid4())
            SESSIONS[session_token] = user_id
            body = b''
            headers = [('Location', '/dashboard'), ('Set-Cookie', f'session_id={session_token}; Path=/; HttpOnly')]
            return '302 Found', headers, [body]


def handle_logout(environ):
    """Log out the current user by deleting their session."""
    cookies = parse_cookies(environ)
    session_id_cookie = cookies.get('session_id')
    if session_id_cookie:
        session_token = session_id_cookie.value
        SESSIONS.pop(session_token, None)
    status = '302 Found'
    headers = [('Location', '/')]
    # Set cookie expiry in past to remove it
    expire_date = (datetime.datetime.utcnow() - datetime.timedelta(days=1)).strftime('%a, %d %b %Y %H:%M:%S GMT')
    headers.append(('Set-Cookie', f'session_id=; expires={expire_date}; Path=/; HttpOnly'))
    return status, headers, [b'']


def handle_dashboard(environ):
    """Show appropriate dashboard based on the user's role."""
    user = get_current_user(environ)
    if not user:
        return redirect('/login')
    if user['role'] == 'client':
        return client_dashboard(environ, user)
    else:
        return inspector_dashboard(environ, user)


def client_dashboard(environ, user):
    """Render dashboard for clients showing their bookings and booking form."""
    # Fetch bookings for this client
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT id, date, time, address, status FROM bookings WHERE client_id = ? ORDER BY id DESC",
        (user['id'],)
    )
    bookings = cur.fetchall()
    conn.close()
    # Build HTML rows for the bookings table
    if bookings:
        rows = []
        for b in bookings:
            booking_id, date, time_val, address, status = b
            rows.append(
                f'<tr>'
                f'<td>{booking_id}</td>'
                f'<td>{date}</td>'
                f'<td>{time_val}</td>'
                f'<td>{address}</td>'
                f'<td>{status.capitalize()}</td>'
                f'</tr>'
            )
        booking_rows = ''.join(rows)
    else:
        booking_rows = '<tr><td colspan="5" class="text-center">No bookings yet.</td></tr>'
    context = {
        'user_name': user['name'],
        'booking_rows': booking_rows
    }
    html = render_template('dashboard_client.html', context)
    return '200 OK', [('Content-Type', 'text/html; charset=utf-8')], [html.encode('utf-8')]


def inspector_dashboard(environ, user):
    """Render dashboard for inspectors showing pending bookings."""
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "SELECT b.id, b.date, b.time, b.address, u.name FROM bookings b JOIN users u ON b.client_id = u.id WHERE b.status = 'pending'"
    )
    bookings = cur.fetchall()
    conn.close()
    # Build rows for the inspector table. Each row includes Accept link.
    if bookings:
        rows = []
        for b in bookings:
            booking_id, date, time_val, address, client_name = b
            rows.append(
                f'<tr>'
                f'<td>{booking_id}</td>'
                f'<td>{date}</td>'
                f'<td>{time_val}</td>'
                f'<td>{address}</td>'
                f'<td>{client_name}</td>'
                f'<td><a href="/accept/{booking_id}" class="btn btn-sm btn-success">Accept</a></td>'
                f'</tr>'
            )
        booking_rows = ''.join(rows)
    else:
        booking_rows = '<tr><td colspan="6" class="text-center">No pending requests.</td></tr>'
    context = {
        'user_name': user['name'],
        'booking_rows': booking_rows
    }
    html = render_template('dashboard_inspector.html', context)
    return '200 OK', [('Content-Type', 'text/html; charset=utf-8')], [html.encode('utf-8')]


def handle_book(environ):
    """Process creation of a new booking for clients."""
    user = get_current_user(environ)
    if not user or user['role'] != 'client':
        return redirect('/login')
    if environ['REQUEST_METHOD'] == 'POST':
        data = get_post_data(environ)
        date = data.get('date', '').strip()
        time = data.get('time', '').strip()
        address = data.get('address', '').strip()
        details = data.get('details', '').strip()
        error = None
        if not date or not time or not address:
            error = 'Please fill in all required fields.'
        if error:
            # For simplicity, redirect back to dashboard with error message in querystring
            return redirect('/dashboard')
        # Insert booking
        conn = sqlite3.connect(DB_PATH)
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO bookings (client_id, date, time, address, details) VALUES (?, ?, ?, ?, ?)",
            (user['id'], date, time, address, details)
        )
        conn.commit()
        conn.close()
        return redirect('/dashboard')
    else:
        # GET is not used for book route
        return redirect('/dashboard')


def handle_accept_booking(environ, booking_id):
    """Allow inspector to accept a booking and mark it as accepted."""
    user = get_current_user(environ)
    if not user or user['role'] != 'inspector':
        return redirect('/login')
    # assign this booking to inspector and update status
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.execute(
        "UPDATE bookings SET status = 'accepted', inspector_id = ? WHERE id = ? AND status = 'pending'",
        (user['id'], booking_id)
    )
    conn.commit()
    conn.close()
    return redirect('/dashboard')


def application(environ, start_response):
    """Main WSGI application callable."""
    setup_testing_defaults(environ)
    path = environ.get('PATH_INFO', '/')
    method = environ['REQUEST_METHOD']
    # Routing
    if path == '/':
        status, headers, body = handle_home(environ)
    elif path == '/register':
        status, headers, body = handle_register(environ)
    elif path == '/login':
        status, headers, body = handle_login(environ)
    elif path == '/logout':
        status, headers, body = handle_logout(environ)
    elif path == '/dashboard':
        status, headers, body = handle_dashboard(environ)
    elif path == '/book':
        status, headers, body = handle_book(environ)
    elif path.startswith('/accept/'):
        # Example: /accept/5
        try:
            booking_id = int(path.split('/')[-1])
        except ValueError:
            status, headers, body = redirect('/dashboard')
        else:
            status, headers, body = handle_accept_booking(environ, booking_id)
    elif path.startswith('/static/'):
        # Serve static files from static directory
        file_path = path[len('/static/'):]  # remove leading '/static/'
        full_path = os.path.join(os.path.dirname(__file__), 'static', file_path)
        if os.path.isfile(full_path):
            with open(full_path, 'rb') as f:
                data = f.read()
            # Determine simple content type based on extension
            ext = os.path.splitext(full_path)[1].lower()
            content_type = 'application/octet-stream'
            if ext == '.css':
                content_type = 'text/css'
            elif ext in ('.png', '.jpg', '.jpeg', '.gif'):
                # ext includes a leading dot, e.g. '.png'. Remove it for MIME subtype
                content_type = f'image/{ext[1:]}'
            elif ext == '.js':
                content_type = 'application/javascript'
            status = '200 OK'
            headers = [('Content-Type', content_type)]
            body = [data]
        else:
            status, headers, body = '404 Not Found', [('Content-Type', 'text/plain')], [b'Not found']
    else:
        status, headers, body = '404 Not Found', [('Content-Type', 'text/plain')], [b'Not found']
    start_response(status, headers)
    return body


if __name__ == '__main__':
    # Initialize DB on first run
    init_db()
    port = 8000
    print(f"Serving on http://localhost:{port}")
    with make_server('', port, application) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("Shutting down...")