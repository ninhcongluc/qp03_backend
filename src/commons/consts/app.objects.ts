export class AppObject {
  static readonly ROLE = {
    ADMIN: 'admin',
    MANAGER: 'manager',
    TEACHER: 'teacher',
    STUDENT: 'student'
  };

  static readonly ROLE_CODE = {
    ADMIN: 1,
    MANAGER: 2,
    TEACHER: 3,
    STUDENT: 4
  };

  static readonly EMAIL_HOST = ['fpt.edu.vn', 'fe.edu.vn'];

  static readonly MAX_FILE_SIZE = 10000000;
}
