import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:mobile_app/services/api_service.dart';
import 'package:image_picker/image_picker.dart';

class ManageProductsScreen extends StatefulWidget {
  @override
  _ManageProductsScreenState createState() => _ManageProductsScreenState();
}

class _ManageProductsScreenState extends State<ManageProductsScreen> {
  List _products = [];
  bool _isLoading = true;

  final ImagePicker _picker = ImagePicker();
  XFile? _selectedImage;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  void _loadProducts() async {
    try {
      final cafeRes = await ApiService.get('/cafes/my-cafe');
      if (cafeRes.statusCode == 200) {
        final cafe = jsonDecode(cafeRes.body);
        final response = await ApiService.get('/products/cafe/${cafe['id']}');
        if (response.statusCode == 200) {
          setState(() {
            _products = jsonDecode(response.body);
            _isLoading = false;
          });
        } else {
          setState(() => _isLoading = false);
        }
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _deleteProduct(int id) async {
    await ApiService.delete('/products/$id');
    _loadProducts();
  }

  void _showAddDialog() {
    TextEditingController nameController = TextEditingController();
    TextEditingController pointsController = TextEditingController(text: '10');
    TextEditingController catController = TextEditingController(text: 'المشروبات');

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
              title: Text('إضافة منتج جديد', style: TextStyle(fontWeight: FontWeight.bold)),
              content: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    TextField(
                      controller: nameController, 
                      decoration: InputDecoration(
                        labelText: 'اسم المنتج',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: catController, 
                      decoration: InputDecoration(
                        labelText: 'تصنيف المنتج (مثال: مشروبات ساخنة)',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    SizedBox(height: 16),
                    TextField(
                      controller: pointsController, 
                      keyboardType: TextInputType.number,
                      decoration: InputDecoration(
                        labelText: 'عدد النقاط الممنوحة للتقييم',
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(16)),
                        contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      ),
                    ),
                    SizedBox(height: 16),
                    GestureDetector(
                      onTap: () async {
                        final picked = await _picker.pickImage(source: ImageSource.gallery);
                        if (picked != null) {
                          setStateDialog(() => _selectedImage = picked);
                        }
                      },
                      child: Container(
                        height: 120,
                        width: double.infinity,
                        decoration: BoxDecoration(
                          color: Theme.of(context).scaffoldBackgroundColor,
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(color: Colors.grey[300]!)
                        ),
                        child: _selectedImage != null
                          ? Center(child: Text("تم اختيار الصورة ✅", style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold), textAlign: TextAlign.center))
                          : Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(Icons.add_photo_alternate, size: 40, color: Colors.grey[400]),
                                SizedBox(height: 8),
                                Text('اضغط لرفع صورة', style: TextStyle(color: Colors.grey[600]))
                              ],
                            ),
                      ),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(onPressed: () => Navigator.pop(context), child: Text('إلغاء', style: TextStyle(color: Colors.grey[600]))),
                ElevatedButton(
                  onPressed: () async {
                    try {
                      String imageUrl = '';
                      if (_selectedImage != null) {
                         final uploadedUrl = await ApiService.uploadImage(_selectedImage!);
                         if (uploadedUrl != null) {
                            imageUrl = ApiService.imgUrl(uploadedUrl);
                         } else {
                            throw Exception('فشل رفع الصورة.');
                         }
                      }
                      
                      final cafeRes = await ApiService.get('/cafes/my-cafe');
                      if (cafeRes.statusCode != 200) {
                          throw Exception('يجب إعداد ملف المقهى أولاً.');
                      }
                      final cafe = jsonDecode(cafeRes.body);

                      final createRes = await ApiService.post('/products', {
                        'name': nameController.text,
                        'image_url': imageUrl,
                        'cafe_id': cafe['id'],
                        'price': 0.0,
                        'description': '',
                        'points_reward': int.tryParse(pointsController.text) ?? 10,
                        'category': catController.text,
                      });

                      if (createRes.statusCode != 201 && createRes.statusCode != 200) {
                          throw Exception('خطأ أثناء حفظ المنتج. الرمز: ${createRes.statusCode}');
                      }

                      Navigator.pop(context);
                      setState(() => _isLoading = true);
                      _loadProducts();
                    } catch (err) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(err.toString())));
                    }
                  },
                  child: Text('حفظ'),
                ),
              ],
            );
          }
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('إدارة قائمة الطعام', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: _isLoading 
        ? Center(child: CircularProgressIndicator()) 
        : _products.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.inventory_2_outlined, size: 80, color: Colors.grey[300]),
                  SizedBox(height: 16),
                  Text("قائمتك فارغة حالياً.", style: TextStyle(color: Colors.grey[500], fontSize: 18))
                ],
              )
            )
          : ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: _products.length,
              itemBuilder: (context, index) {
                final p = _products[index];
                String pImage = (p['image_url'] != null && p['image_url'].toString().isNotEmpty) ? p['image_url'] : '';

                return Container(
                  margin: EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: Offset(0, 4))]
                  ),
                  child: ListTile(
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                    leading: Container(
                      width: 50, height: 50,
                      decoration: BoxDecoration(borderRadius: BorderRadius.circular(12), color: Theme.of(context).scaffoldBackgroundColor),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(12),
                        child: pImage.isNotEmpty ? Image.network(pImage, fit: BoxFit.cover, errorBuilder: (_,__,___) => Icon(Icons.fastfood, color: Colors.grey)) : Icon(Icons.fastfood, color: Colors.grey),
                      )
                    ),
                    title: Text(p['name'], style: TextStyle(fontWeight: FontWeight.bold)),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Text('🎁 مكافأة التقييم: ${p['points_reward'] ?? 10} نقطة', style: TextStyle(color: Colors.amber[800], fontWeight: FontWeight.w700, fontSize: 13)),
                    ),
                    trailing: IconButton(
                      icon: Icon(Icons.delete_outline, color: Colors.red[400]),
                      onPressed: () => _deleteProduct(p['id']),
                    ),
                  ),
                );
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showAddDialog,
        backgroundColor: Theme.of(context).colorScheme.primary,
        icon: Icon(Icons.add, color: Colors.white),
        label: Text("إضافة منتج", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
