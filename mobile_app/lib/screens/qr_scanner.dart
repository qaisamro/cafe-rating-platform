import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class QRScanner extends StatefulWidget {
  @override
  _QRScannerState createState() => _QRScannerState();
}

class _QRScannerState extends State<QRScanner> {
  bool _scanned = false;
  final MobileScannerController _controller = MobileScannerController();

  void _onDetect(BarcodeCapture capture) async {
    if (_scanned) return;
    final barcode = capture.barcodes.first;
    final String? rawValue = barcode.rawValue;
    if (rawValue == null) return;
    setState(() => _scanned = true);
    _controller.stop();

    final response = await ApiService.post('/qr/scan', {'qr_data': rawValue});
    if (!mounted) return;
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      _showResult(true, '🎉 تم الحصول على ${data['points'] ?? 10} نقاط!');
    } else {
      _showResult(false, 'تعذّر المسح، تأكد من صحة الكود');
    }
  }

  void _showResult(bool success, String message) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        title: Text(success ? '✅ نجاح!' : '❌ خطأ', style: GoogleFonts.cairo(fontWeight: FontWeight.w900)),
        content: Text(message, style: GoogleFonts.cairo(fontSize: 16, color: AppColors.textSecondary)),
        actions: [
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: success ? AppColors.success : AppColors.danger,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('حسناً', style: GoogleFonts.cairo(color: Colors.white, fontWeight: FontWeight.w700)),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() { _controller.dispose(); super.dispose(); }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          // Camera Scanner
          MobileScanner(
            controller: _controller,
            onDetect: _onDetect,
          ),

          // Overlay
          SafeArea(
            child: Column(
              children: [
                // Top Bar
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      IconButton(
                        icon: Icon(Icons.arrow_forward_ios, color: Colors.white, size: 22),
                        onPressed: () => Navigator.pop(context),
                      ),
                      Text('مسح رمز QR', style: GoogleFonts.cairo(color: Colors.white, fontSize: 20, fontWeight: FontWeight.w800)),
                      IconButton(
                        icon: Icon(Icons.flash_on_rounded, color: Colors.white, size: 26),
                        onPressed: () => _controller.toggleTorch(),
                      ),
                    ],
                  ),
                ),

                Spacer(),

                // Scanner Frame
                Container(
                  width: 260, height: 260,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(28),
                    border: Border.all(color: AppColors.accent, width: 3),
                  ),
                  child: Stack(
                    children: [
                      // Corner decorations
                      ..._corners(),
                    ],
                  ),
                ),

                SizedBox(height: 32),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black54,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: Colors.white24),
                  ),
                  child: Text(
                    'ضع رمز QR داخل الإطار ليتم مسحه تلقائياً',
                    style: GoogleFonts.cairo(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w600),
                    textAlign: TextAlign.center,
                  ),
                ),
                Spacer(),
                SizedBox(height: 40),
              ],
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _corners() {
    const c = AppColors.accent;
    const s = 30.0;
    const t = 4.0;
    return [
      // Top-right
      Positioned(top: 0, right: 0, child: _Corner(s, t, c, BorderRadius.only(topRight: Radius.circular(28)))),
      // Top-left
      Positioned(top: 0, left: 0, child: _Corner(s, t, c, BorderRadius.only(topLeft: Radius.circular(28)))),
      // Bottom-right
      Positioned(bottom: 0, right: 0, child: _Corner(s, t, c, BorderRadius.only(bottomRight: Radius.circular(28)))),
      // Bottom-left
      Positioned(bottom: 0, left: 0, child: _Corner(s, t, c, BorderRadius.only(bottomLeft: Radius.circular(28)))),
    ];
  }
}

class _Corner extends StatelessWidget {
  final double size, thickness;
  final Color color;
  final BorderRadius radius;
  _Corner(this.size, this.thickness, this.color, this.radius);
  @override
  Widget build(BuildContext context) => Container(
    width: size, height: size,
    decoration: BoxDecoration(
      border: Border.all(color: color, width: thickness),
      borderRadius: radius,
    ),
  );
}
