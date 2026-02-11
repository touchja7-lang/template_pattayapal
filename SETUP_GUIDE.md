# คู่มือการติดตั้งและใช้งานระบบ Pattaya Community (Updated)

## ภาพรวมระบบที่พัฒนา

ระบบข่าวสาร Pattaya Community ที่ได้รับการพัฒนาเพิ่มเติมด้วยฟีเจอร์ใหม่ที่สมบูรณ์แบบ:

### ฟีเจอร์ที่เพิ่มเข้ามาใหม่

1. **ระบบโปรไฟล์ผู้ใช้ (User Profile)**
   - หน้าจัดการข้อมูลส่วนตัว
   - สามารถเปลี่ยนชื่อ-นามสกุล และอีเมล
   - ระบบเปลี่ยนรหัสผ่านใหม่

2. **ระบบจัดการสำหรับ Admin (Admin Dashboard)**
   - หน้า Dashboard สำหรับ Admin เท่านั้น
   - **เพิ่มข่าวใหม่**: สามารถกรอกหัวข้อ, เนื้อหา (HTML), เลือกหมวดหมู่ และใส่ URL รูปภาพ
   - **แก้ไขข่าว**: ปรับปรุงเนื้อหาข่าวที่มีอยู่เดิม
   - **ลบข่าว**: ลบข่าวที่ไม่ต้องการออกจากระบบ

3. **ระบบคอมเมนต์ที่สมบูรณ์ (Comment System)**
   - **แก้ไขแล้ว!** เชื่อมต่อ Backend และ Frontend ให้ใช้งานได้จริง
   - แสดงความคิดเห็นบนแต่ละข่าว (ต้อง Login)
   - แสดงชื่อผู้ใช้และเวลาที่คอมเมนต์
   - ลบคอมเมนต์ของตนเองได้

4. **ระบบจัดหมวดหมู่ข่าว (Category System)**
   - กรองข่าวตามหมวดหมู่ในหน้าข่าวสาร
   - แสดงหมวดหมู่: กีฬา, เศรษฐกิจ, การเมือง, เทคโนโลยี, อาชญากรรม

5. **ฐานข้อมูล MongoDB**
   - เชื่อมต่อกับ MongoDB Atlas
   - Models: User, News, Category, Comment, Place

## โครงสร้างโปรเจกต์ที่สำคัญ

```
Customer-project/
├── backend/
│   ├── models/
│   │   ├── User.js               # เพิ่มฟิลด์ role (user/admin)
│   │   ├── News.js               # โครงสร้างข้อมูลข่าว
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js               # เพิ่ม Route อัปเดตโปรไฟล์
│   │   ├── news.js               # เพิ่ม Route แก้ไข/ลบข่าว (Admin)
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js               # ตรวจสอบการเข้าสู่ระบบ
│   │   └── admin.js              # ตรวจสอบสิทธิ์ Admin
│   ├── createAdmin.js            # สคริปต์สร้างบัญชี Admin เริ่มต้น
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Profile.jsx        # หน้าจัดการโปรไฟล์
│   │   │   ├── AdminDashboard.jsx # หน้าจัดการข่าวสารสำหรับ Admin
│   │   │   └── ...
│   │   ├── services/
│   │   │   └── api.js            # อัปเดต API calls ทั้งหมด
│   │   └── css/
│   │       ├── Admin.css         # CSS สำหรับระบบ Admin
│   │       └── ...
└── .env                          # ตั้งค่าการเชื่อมต่อ DB
```

## การติดตั้งและรันโปรเจกต์

### 1. ติดตั้ง Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
pnpm install # หรือ npm install
```

### 2. ตั้งค่า Environment Variables

ตรวจสอบไฟล์ `.env` ในโฟลเดอร์หลัก:
```
MONGODB_URI=mongodb+srv://official_db_user:nD58xMam37TqNArz@cluster0.q95ypap.mongodb.net/
PORT=5000
JWT_SECRET=pattaya-community-secret-key-2025
```

### 3. สร้างบัญชี Admin เริ่มต้น (สำคัญ!)

รันคำสั่งนี้เพื่อสร้างบัญชี Admin สำหรับเข้าจัดการระบบ:
```bash
cd backend
node createAdmin.js
```
**ข้อมูลเข้าสู่ระบบ Admin:**
- **Username**: admin
- **Password**: admin123456

### 4. รันระบบ

**รัน Backend:**
```bash
cd backend
node server.js
```

**รัน Frontend:**
```bash
cd frontend
pnpm run dev
```

## การใช้งานฟีเจอร์ใหม่

### การจัดการโปรไฟล์
1. เข้าสู่ระบบ
2. คลิกไอคอนผู้ใช้ที่ Navbar -> เลือก "โปรไฟล์ของฉัน"
3. แก้ไขข้อมูลหรือเปลี่ยนรหัสผ่านตามต้องการ

### การจัดการข่าวสาร (สำหรับ Admin)
1. เข้าสู่ระบบด้วยบัญชี Admin
2. คลิกไอคอนผู้ใช้ที่ Navbar -> เลือก "จัดการระบบ"
3. ในหน้า Dashboard คุณสามารถ:
   - คลิก "เพิ่มข่าวใหม่" เพื่อโพสต์ข่าว
   - คลิกไอคอน "ดินสอ" เพื่อแก้ไขข่าว
   - คลิกไอคอน "ถังขยะ" เพื่อลบข่าว

### การแสดงความคิดเห็น
1. เข้าสู่ระบบ
2. เปิดหน้าข่าวสารที่ต้องการ
3. พิมพ์ข้อความในช่องคอมเมนต์ด้านล่างแล้วกดส่ง

## เทคโนโลยีที่ใช้
- **Frontend**: React, React Router, Axios, Context API, React Icons
- **Backend**: Node.js, Express, MongoDB, Mongoose, JWT, Bcrypt

---
พัฒนาโดย Manus AI สำหรับ Pattaya Community
วันที่อัปเดต: 10 กุมภาพันธ์ 2026
