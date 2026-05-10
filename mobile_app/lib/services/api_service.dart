import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

import 'package:flutter/foundation.dart';
import 'package:image_picker/image_picker.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:5000/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token != null ? 'Bearer $token' : '',
    };
  }

  static Future<http.Response> post(String endpoint, Map<String, dynamic> data) async {
    final headers = await getHeaders();
    return await http.post(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
  }

  static Future<http.Response> get(String endpoint) async {
    final headers = await getHeaders();
    return await http.get(Uri.parse('$baseUrl$endpoint'), headers: headers);
  }

  static Future<http.Response> put(String endpoint, Map<String, dynamic> data) async {
    final headers = await getHeaders();
    return await http.put(
      Uri.parse('$baseUrl$endpoint'),
      headers: headers,
      body: jsonEncode(data),
    );
  }

  static Future<http.Response> delete(String endpoint) async {
    final headers = await getHeaders();
    return await http.delete(Uri.parse('$baseUrl$endpoint'), headers: headers);
  }

  static Future<String?> uploadImage(XFile file) async {
    final token = await getToken();
    var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/products/upload'));
    if (token != null) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    
    if (kIsWeb) {
      final bytes = await file.readAsBytes();
      request.files.add(http.MultipartFile.fromBytes('image', bytes, filename: file.name));
    } else {
      request.files.add(await http.MultipartFile.fromPath('image', file.path));
    }

    var res = await request.send();
    if (res.statusCode == 200) {
      var resData = await res.stream.bytesToString();
      return jsonDecode(resData)['imageUrl'];
    }
    return null;
  }
}



