import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/screens/login_screen.dart';
import 'package:mobile_app/screens/register_screen.dart';

class WelcomeScreen extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: BoxDecoration(gradient: AppColors.heroGradient),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    // Decorative circles
                    _DecorativeCircles(),
                    SizedBox(height: 40),
                    // Logo
                    Container(
                      width: 100, height: 100,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(32),
                        border: Border.all(color: Colors.white.withOpacity(0.3), width: 1),
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.15), blurRadius: 40, offset: Offset(0, 20))],
                      ),
                      child: Icon(Icons.coffee_rounded, size: 50, color: Colors.white),
                    ),
                    SizedBox(height: 32),
                    Text(
                      'كافيه كونكت',
                      style: GoogleFonts.cairo(
                        fontSize: 42, fontWeight: FontWeight.w900,
                        color: Colors.white,
                        letterSpacing: -0.5,
                      ),
                    ),
                    SizedBox(height: 12),
                    Text(
                      'منصة المقاهي العربية الأولى\nاكتشف، قيّم، واكسب المكافآت',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.cairo(
                        color: Colors.white.withOpacity(0.82),
                        fontSize: 17, height: 1.6,
                      ),
                    ),
                    SizedBox(height: 48),
                    // Stats row
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        _Stat('500+', 'مقهى'),
                        _StatDivider(),
                        _Stat('12K+', 'مستخدم'),
                        _StatDivider(),
                        _Stat('98%', 'رضا'),
                      ],
                    ),
                  ],
                ),
              ),
              // Bottom buttons
              Padding(
                padding: EdgeInsets.fromLTRB(28, 0, 28, 48),
                child: Column(
                  children: [
                    ElevatedButton(
                      onPressed: () => Navigator.push(context, _fadeRoute(LoginScreen())),
                      child: Text('تسجيل الدخول'),
                      style: ElevatedButton.styleFrom(
                        minimumSize: Size(double.infinity, 60),
                        backgroundColor: Colors.white,
                        foregroundColor: AppColors.primary,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        textStyle: GoogleFonts.cairo(fontWeight: FontWeight.w800, fontSize: 17),
                        elevation: 0,
                      ),
                    ),
                    SizedBox(height: 14),
                    OutlinedButton(
                      onPressed: () => Navigator.push(context, _fadeRoute(RegisterScreen())),
                      child: Text('إنشاء حساب جديد'),
                      style: OutlinedButton.styleFrom(
                        minimumSize: Size(double.infinity, 60),
                        foregroundColor: Colors.white,
                        side: BorderSide(color: Colors.white.withOpacity(0.5), width: 1.5),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                        textStyle: GoogleFonts.cairo(fontWeight: FontWeight.w700, fontSize: 17),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  PageRoute _fadeRoute(Widget page) => PageRouteBuilder(
    pageBuilder: (_, __, ___) => page,
    transitionsBuilder: (_, animation, __, child) =>
        FadeTransition(opacity: animation, child: child),
    transitionDuration: Duration(milliseconds: 300),
  );
}

class _DecorativeCircles extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      height: 0,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          Positioned(top: -200, right: -80, child: _Circle(200, 0.06)),
          Positioned(top: -120, left: -60, child: _Circle(150, 0.05)),
        ],
      ),
    );
  }
}

class _Circle extends StatelessWidget {
  final double size;
  final double opacity;
  _Circle(this.size, this.opacity);
  @override
  Widget build(BuildContext context) => Container(
    width: size, height: size,
    decoration: BoxDecoration(
      color: Colors.white.withOpacity(opacity),
      shape: BoxShape.circle,
    ),
  );
}

class _Stat extends StatelessWidget {
  final String val, label;
  _Stat(this.val, this.label);
  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(val, style: GoogleFonts.cairo(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900)),
      SizedBox(height: 4),
      Text(label, style: GoogleFonts.cairo(color: Colors.white.withOpacity(0.65), fontSize: 13)),
    ],
  );
}

class _StatDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) => Container(
    height: 32, width: 1, margin: EdgeInsets.symmetric(horizontal: 24),
    color: Colors.white.withOpacity(0.3),
  );
}
