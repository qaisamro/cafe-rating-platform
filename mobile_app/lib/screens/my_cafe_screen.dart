import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_app/main.dart';
import 'package:mobile_app/services/api_service.dart';

class MyCafeScreen extends StatefulWidget {
  @override
  _MyCafeScreenState createState() => _MyCafeScreenState();
}

class _MyCafeScreenState extends State<MyCafeScreen> {
  final _name = TextEditingController();
  final _address = TextEditingController();
  final _desc = TextEditingController();
  int? _cafeId;
  String? _imageUrl;
  bool _isLoading = true;
  bool _isUploading = false;
  bool _isSaving = false;

  @override
  void initState() { super.initState(); _loadCafe(); }

  void _loadCafe() async {
    try {
      final res = await ApiService.get('/cafes/my-cafe');
      if (res.statusCode == 200 && mounted) {
        final cafe = jsonDecode(res.body);
        setState(() {
          _cafeId = cafe['id'];
          _name.text = cafe['name'] ?? '';
          _address.text = cafe['address'] ?? '';
          _desc.text = cafe['description'] ?? '';
          _imageUrl = cafe['image_url'];
          _isLoading = false;
        });
      } else if (mounted) setState(() => _isLoading = false);
    } catch (_) { if (mounted) setState(() => _isLoading = false); }
  }

  String _imgUrl(String? url) => ApiService.imgUrl(url);

  Future<void> _pickAndUpload() async {
    final picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery, imageQuality: 75);
    if (image != null) {
      setState(() => _isUploading = true);
      final url = await ApiService.uploadImage(image);
      if (url != null) {
        setState(() { _imageUrl = url; _isUploading = false; });
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('✅ تم رفع الصورة بنجاح!', style: GoogleFonts.cairo()), backgroundColor: AppColors.success, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))));
      } else {
        setState(() => _isUploading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('❌ فشل رفع الصورة', style: GoogleFonts.cairo()), backgroundColor: AppColors.danger, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))));
      }
    }
  }

  void _saveCafe() async {
    setState(() => _isSaving = true);
    final imageToSave = ApiService.imgUrl(_imageUrl);
    final data = { 'name': _name.text, 'address': _address.text, 'description': _desc.text, 'image_url': imageToSave };
    final res = _cafeId == null ? await ApiService.post('/cafes', data) : await ApiService.put('/cafes/$_cafeId', data);
    setState(() => _isSaving = false);
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Text(res.statusCode == 200 || res.statusCode == 201 ? '✅ تم حفظ معلومات المقهى بنجاح!' : '❌ حدث خطأ أثناء الحفظ', style: GoogleFonts.cairo(fontWeight: FontWeight.w700)),
      backgroundColor: (res.statusCode == 200 || res.statusCode == 201) ? AppColors.success : AppColors.danger,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
    ));
    if (res.statusCode == 200 || res.statusCode == 201) _loadCafe();
  }

  @override
  Widget build(BuildContext context) {
    final imgUrl = _imgUrl(_imageUrl);
    return Scaffold(
      backgroundColor: AppColors.bg,
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: AppColors.primary))
          : SingleChildScrollView(
              padding: EdgeInsets.fromLTRB(24, 20, 24, 40),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  SizedBox(height: 20),
                  // Image Picker
                  Center(
                    child: Stack(
                      children: [
                        Container(
                          width: 160, height: 160,
                          decoration: BoxDecoration(
                            color: AppColors.primaryLight,
                            shape: BoxShape.circle,
                            boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.15), blurRadius: 30, offset: Offset(0, 12))],
                            image: imgUrl.isNotEmpty ? DecorationImage(image: NetworkImage(imgUrl), fit: BoxFit.cover) : null,
                          ),
                          child: imgUrl.isEmpty ? Icon(Icons.storefront_rounded, size: 64, color: AppColors.primary) : null,
                        ),
                        if (_isUploading)
                          Container(width: 160, height: 160, decoration: BoxDecoration(color: Colors.black38, shape: BoxShape.circle), child: Center(child: CircularProgressIndicator(color: Colors.white, strokeWidth: 3))),
                        Positioned(
                          bottom: 4, right: 4,
                          child: GestureDetector(
                            onTap: _pickAndUpload,
                            child: Container(
                              padding: EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                gradient: AppColors.cardGradient,
                                shape: BoxShape.circle,
                                border: Border.all(color: Colors.white, width: 3),
                                boxShadow: [BoxShadow(color: AppColors.primary.withOpacity(0.3), blurRadius: 12)],
                              ),
                              child: Icon(Icons.camera_alt_rounded, color: Colors.white, size: 22),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  SizedBox(height: 10),
                  Center(child: Text('اضغط على الكاميرا لتغيير صورة المقهى', style: GoogleFonts.cairo(color: AppColors.textMuted, fontSize: 13))),
                  SizedBox(height: 40),
                  Text('المعلومات الأساسية', style: GoogleFonts.cairo(fontSize: 20, fontWeight: FontWeight.w800, color: AppColors.textPrimary)),
                  SizedBox(height: 24),
                  _Field(controller: _name, label: 'اسم المقهى', hint: 'مثال: كافيه المدينة', icon: Icons.title_rounded),
                  SizedBox(height: 18),
                  _Field(controller: _address, label: 'العنوان الجغرافي', hint: 'المدينة، الشارع، الرقم', icon: Icons.location_on_outlined),
                  SizedBox(height: 18),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('وصف المقهى وقصته', style: GoogleFonts.cairo(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
                      SizedBox(height: 8),
                      TextField(
                        controller: _desc, textAlign: TextAlign.right, maxLines: 5, style: GoogleFonts.cairo(),
                        decoration: InputDecoration(hintText: 'أخبرنا عن مقهاك بكلماتك...', hintStyle: GoogleFonts.cairo(color: AppColors.textMuted),
                          prefixIcon: Padding(padding: EdgeInsets.only(bottom: 80, right: 14, left: 12), child: Icon(Icons.description_outlined, color: AppColors.textMuted))),
                      ),
                    ],
                  ),
                  SizedBox(height: 48),
                  ElevatedButton(
                    onPressed: _isSaving ? null : _saveCafe,
                    style: ElevatedButton.styleFrom(
                      minimumSize: Size(double.infinity, 58),
                      backgroundColor: AppColors.primary,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(18)),
                      elevation: 0,
                    ),
                    child: _isSaving
                        ? SizedBox(width: 22, height: 22, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5))
                        : Text('حفظ التغييرات', style: GoogleFonts.cairo(fontSize: 17, fontWeight: FontWeight.w800, color: Colors.white)),
                  ),
                ],
              ),
            ),
    );
  }
}

class _Field extends StatelessWidget {
  final TextEditingController controller;
  final String label, hint;
  final IconData icon;
  _Field({required this.controller, required this.label, required this.hint, required this.icon});
  @override
  Widget build(BuildContext context) => Column(
    crossAxisAlignment: CrossAxisAlignment.start,
    children: [
      Text(label, style: GoogleFonts.cairo(fontSize: 13, fontWeight: FontWeight.w700, color: AppColors.textSecondary)),
      SizedBox(height: 8),
      TextField(controller: controller, textAlign: TextAlign.right, style: GoogleFonts.cairo(),
        decoration: InputDecoration(hintText: hint, hintStyle: GoogleFonts.cairo(color: AppColors.textMuted), prefixIcon: Icon(icon, color: AppColors.textMuted))),
    ],
  );
}
