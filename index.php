    <?php
// Hospital Management System - Main Entry Point
header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة المستشفى - Hospital Management System</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .container {
            background: rgba(255, 255, 255, 0.95);
            border-radius: 15px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 500px;
            width: 100%;
        }
        h1 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 2.5em;
        }
        .status {
            background: #27ae60;
            color: white;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 1.2em;
        }
        .links {
            margin-top: 30px;
        }
        .btn {
            display: inline-block;
            background: #3498db;
            color: white;
            padding: 12px 25px;
            text-decoration: none;
            border-radius: 6px;
            margin: 10px;
            font-size: 1.1em;
            transition: background 0.3s;
        }
        .btn:hover {
            background: #2980b9;
        }
        .vue-btn {
            background: #4fc08d;
        }
        .vue-btn:hover {
            background: #42a179;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 نظام إدارة المستشفى</h1>
        <div class="status">
            ✅ النظام يعمل بنجاح!
        </div>
        <p>مرحباً بك في نظام إدارة المستشفى الشامل</p>
        
        <div class="links">
            <a href="http://localhost:3000" class="btn vue-btn" target="_blank">
                🚀 التطبيق الأمامي (Vue.js)
            </a>
            <a href="backend/" class="btn">
                ⚙️ واجهة برمجة التطبيقات (API)
            </a>

        </div>
        
        <p style="margin-top: 30px; color: #7f8c8d;">
            <strong>المنافذ:</strong><br>
            Frontend: http://localhost:3000<br>
            Backend: http://localhost:8000<br>
            phpMyAdmin: http://localhost:8080
        </p>
    </div>
</body>
</html>
