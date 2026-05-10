import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/user_main_tab.dart';
import 'package:mobile_app/screens/owner_main_tab.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _email = TextEditingController();
  final _pass = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  void _login() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await ApiService.post('/auth/login', { 'email': _email.text.trim(), 'password': _pass.text });
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('token', data['token']);
        await prefs.setString('role', data['user']['role']);
        Navigator.pushAndRemoveUntil(
          context,
          MaterialPageRoute(builder: (_) => data['user']['role'] == 'owner' ? OwnerMainTab() : UserMainTab()),
          (r) => false,
        );
      } else {
        setState(() => _error = 'البريد أو كلمة المرور غير صحيحة');
      }
    } catch (e) {
      setState(() => _error = 'تعذر الاتصال بالخادم. تحقق من اتصالك.');
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: EdgeInsets.symmetric(horizontal: 28),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              SizedBox(height: 60),
              // Header
              Container(
                width: 72, height: 72,
                decoration: BoxDecoration(
                  gradient: AppColors.cardGradient,
                  borderRadius: BorderRadius.circular(22),
                  boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.25), blurRadius: 25, offset: Offset(0, 12))],
                ),
                child: Icon(Icons.coffee_rounded, color: Colors.white, size: 34),
              ),
              SizedBox(height: 28),
              Text('أهلاً بعودتك', style: GoogleFonts.cairo(fontSize: 36, fontWeight: FontWeight.w900, color: AppColors.textPrimary, height: 1.1)),
              SizedBox(height: 10),
              Text('سجّل دخولك وتعرف على أفضل المقاهي', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 16)),
              SizedBox(height: 48),

              if (_error != null) ...[
                Container(
                  padding: EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    color: AppColors.danger.withOpacity(0.08),
                    borderRadius: BorderRadius.circular(14),
                    border: Border.all(color: AppColors.danger.withOpacity(0.2)),
                  ),
                  child: Row(children: [
                    Icon(Icons.error_outline, color: AppColors.danger, size: 18),
                    SizedBox(width: 10),
                    Expanded(child: Text(_error!, style: GoogleFonts.cairo(color: AppColors.danger, fontWeight: FontWeight.w600, fontSize: 14))),
                  ]),
                ),
                SizedBox(height: 20),
              ],

              // Email field
              _label('البريد الإلكتروني'),
              SizedBox(height: 8),
              TextField(
                controller: _email,
                keyboardType: TextInputType.emailAddress,
                textAlign: TextAlign.right,
                style: GoogleFonts.cairo(),
                decoration: InputDecoration(
                  hintText: 'email@example.com',
                  hintStyle: GoogleFonts.cairo(color: AppColors.textMuted),
                  prefixIcon: Icon(Icons.email_outlined, color: AppColors.textMuted),
                ),
              ),
              SizedBox(height: 20),
              _label('كلمة المرور'),
              SizedBox(height: 8),
              TextField(
                controller: _pass,
                obscureText: _obscure,
                textAlign: TextAlign.right,
                style: GoogleFonts.cairo(),
                decoration: InputDecoration(
                  hintText: '••••••••',
                  hintStyle: GoogleFonts.cairo(color: AppColors.textMuted),
                  prefixIcon: Icon(Icons.lock_outline, color: AppColors.textMuted),
                  suffixIcon: IconButton(
                    icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: AppColors.textMuted),
                    onPressed: () => setState(() => _obscure = !_obscure),
                  ),
                ),
              ),
              SizedBox(height: 36),

              ElevatedButton(
                onPressed: _loading ? null : _login,
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 60),
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                  elevation: 0,
                ),
                child: _loading
                    ? SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : Text('تسجيل الدخول', style: GoogleFonts.cairo(fontSize: 17, fontWeight: FontWeight.w800)),
              ),
              SizedBox(height: 20),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: Text('ليس لديك حساب؟ إنشاء حساب جديد', style: GoogleFonts.cairo(color: AppColors.primary, fontWeight: FontWeight.w700)),
              ),
              SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _label(String text) => Text(text, style: GoogleFonts.cairo(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textSecondary));
}
