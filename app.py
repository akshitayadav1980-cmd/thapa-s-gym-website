from flask import Flask, request, jsonify, send_from_directory
import mysql.connector
from mysql.connector import Error
import os

app = Flask(__name__, static_folder='.', static_url_path='')

# Hardcoded common passwords to try for typical local installs
passwords_to_try = ['', 'root', '1234', 'password', 'mysql']

def get_db_connection(use_database=True):
    for pwd in passwords_to_try:
        try:
            conn = mysql.connector.connect(
                host='localhost',
                user='root',
                password=pwd,
                database='gym_db' if use_database else None
            )
            if conn.is_connected():
                return conn, pwd
        except Error as e:
            continue
    raise Exception("Could not connect to MySQL with common local passwords. Please check your MySQL setup.")

def init_db():
    try:
        # First connect without specifying database to create it if it doesn't exist
        conn, pwd = get_db_connection(use_database=False)
        cursor = conn.cursor()
        cursor.execute("CREATE DATABASE IF NOT EXISTS gym_db")
        cursor.close()
        conn.close()

        # Connect to gym_db and create table
        conn, pwd = get_db_connection(use_database=True)
        cursor = conn.cursor()
        create_table_query = """
        CREATE TABLE IF NOT EXISTS leads (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            plan VARCHAR(50) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        cursor.execute(create_table_query)
        conn.commit()
        cursor.close()
        conn.close()
        print(f"Database initialized successfully (Using password: '{pwd}')")
    except Exception as e:
        print(f"Database Initialization Error: {e}")

@app.route('/')
def serve_index():
    return send_from_directory('.', 'index.html')

@app.route('/api/join', methods=['POST'])
def join_gym():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    plan = data.get('plan')

    if not all([name, email, phone, plan]):
        return jsonify({"error": "Missing required fields"}), 400

    try:
        conn, _ = get_db_connection(use_database=True)
        cursor = conn.cursor()
        insert_query = """
        INSERT INTO leads (name, email, phone, plan) 
        VALUES (%s, %s, %s, %s)
        """
        cursor.execute(insert_query, (name, email, phone, plan))
        conn.commit()
        cursor.close()
        conn.close()
        return jsonify({"success": True, "message": "Lead captured successfully!"}), 201
    except Exception as e:
        print(f"Error inserting lead: {e}")
        return jsonify({"error": "Database error"}), 500

if __name__ == '__main__':
    init_db()
    # Run on port 5000 so we don't conflict with any other python servers
    app.run(port=5000, debug=True)
