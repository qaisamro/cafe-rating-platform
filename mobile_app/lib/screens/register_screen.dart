import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:mobile_app/screens/welcome_screen.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _pass = TextEditingController();
  bool _loading = false;
  bool _obscure = true;
  String? _error;

  void _register() async {
    setState(() { _loading = true; _error = null; });
    try {
      final res = await ApiService.post('/auth/register', {
        'name': _name.text.trim(),
        'email': _email.text.trim(),
        'password': _pass.text,
        'role': 'user',
      });
      if (res.statusCode == 201 || res.statusCode == 200) {
        showDialog(
          context: context,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
            title: Row(children: [Text('🎉 ', style: TextStyle(fontSize: 24)), Text('تم إنشاء حسابك!', style: GoogleFonts.cairo(fontWeight: FontWeight.w800))]),
            content: Text('حسابك جاهز! يمكنك الآن تسجيل الدخول والاستكشاف.', style: GoogleFonts.cairo(color: AppColors.textMuted)),
            actions: [
              ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  Navigator.pushAndRemoveUntil(context, MaterialPageRoute(builder: (_) => WelcomeScreen()), (r) => false);
                },
                child: Text('تسجيل الدخول'),
              ),
            ],
          ),
        );
      } else {
        final body = jsonDecode(res.body);
        setState(() => _error = body['message'] ?? 'حدث خطأ أثناء إنشاء الحساب');
      }
    } catch (e) {
      setState(() => _error = 'تعذر الاتصال بالخادم');
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
              SizedBox(height: 48),
              Row(children: [
                IconButton(
                  icon: Icon(Icons.arrow_forward_ios, color: AppColors.textMuted, size: 20),
                  onPressed: () => Navigator.pop(context),
                ),
              ]),
              SizedBox(height: 16),
              Text('إنشاء حساب جديد', style: GoogleFonts.cairo(fontSize: 34, fontWeight: FontWeight.w900, color: AppColors.textPrimary, height: 1.1)),
              SizedBox(height: 10),
              Text('انضم لمجتمع المقاهي العربي الأول', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 16)),
              SizedBox(height: 40),

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
                    Text(_error!, style: GoogleFonts.cairo(color: AppColors.danger, fontWeight: FontWeight.w600, fontSize: 14)),
                  ]),
                ),
                SizedBox(height: 20),
              ],

              _label('الاسم الكامل'),
              SizedBox(height: 8),
              TextField(controller: _name, textAlign: TextAlign.right, style: GoogleFonts.cairo(),
                decoration: InputDecoration(hintText: 'محمد أحمد', hintStyle: GoogleFonts.cairo(color: AppColors.textMuted), prefixIcon: Icon(Icons.person_outline, color: AppColors.textMuted))),
              SizedBox(height: 20),
              _label('البريد الإلكتروني'),
              SizedBox(height: 8),
              TextField(controller: _email, keyboardType: TextInputType.emailAddress, textAlign: TextAlign.right, style: GoogleFonts.cairo(),
                decoration: InputDecoration(hintText: 'email@example.com', hintStyle: GoogleFonts.cairo(color: AppColors.textMuted), prefixIcon: Icon(Icons.email_outlined, color: AppColors.textMuted))),
              SizedBox(height: 20),
              _label('كلمة المرور'),
              SizedBox(height: 8),
              TextField(
                controller: _pass, obscureText: _obscure, textAlign: TextAlign.right, style: GoogleFonts.cairo(),
                decoration: InputDecoration(
                  hintText: '8 أحرف على الأقل', hintStyle: GoogleFonts.cairo(color: AppColors.textMuted),
                  prefixIcon: Icon(Icons.lock_outline, color: AppColors.textMuted),
                  suffixIcon: IconButton(icon: Icon(_obscure ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: AppColors.textMuted), onPressed: () => setState(() => _obscure = !_obscure)),
                ),
              ),
              SizedBox(height: 36),
              ElevatedButton(
                onPressed: _loading ? null : _register,
                style: ElevatedButton.styleFrom(
                  minimumSize: Size(double.infinity, 60), backgroundColor: AppColors.primary, foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)), elevation: 0,
                ),
                child: _loading
                    ? SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                    : Text('إنشاء الحساب', style: GoogleFonts.cairo(fontSize: 17, fontWeight: FontWeight.w800)),
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
