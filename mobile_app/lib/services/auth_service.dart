import 'dart:convert';
import 'package:mobile_app/services/api_service.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthService {
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await ApiService.post('/auth/login', {
      'email': email,
      'password': password,
    });

    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('token', data['token']);
      await prefs.setString('role', data['user']['role']);
      return data;
    } else {
      throw Exception('Login failed');
    }
  }

  Future<void> register(String name, String email, String password, String role) async {
    final response = await ApiService.post('/auth/register', {
      'name': name,
      'email': email,
      'password': password,
      'role': role,
    });

    if (response.statusCode != 201) {
      throw Exception('Registration failed');
    }
  }

  Future<void> logout() async {

    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
    await prefs.remove('role');
  }
}
