import 'dart:convert';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:mobile_app/services/api_service.dart';

class SpinWheel extends StatefulWidget {
  @override
  _SpinWheelState createState() => _SpinWheelState();
}

class _SpinWheelState extends State<SpinWheel> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  String _result = 'أدر العجلة لتربح!';
  bool _isSpinning = false;
  bool _canSpin = true;
  double _hoursRemaining = 0.0;
  List _availableRewards = [];
  bool _isLoadingStatus = true;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: Duration(seconds: 4));
    _animation = CurvedAnimation(parent: _controller, curve: Curves.decelerate);
    _loadStatus();
  }

  void _loadStatus() async {
    try {
      final statusRes = await ApiService.get('/gamification/spin-status');
      final rewardsRes = await ApiService.get('/gamification/rewards');
      
      if (mounted) {
        setState(() {
          if (statusRes.statusCode == 200) {
            final data = jsonDecode(statusRes.body);
            _canSpin = data['canSpin'] ?? true;
            _hoursRemaining = (data['hoursRemaining'] as num?)?.toDouble() ?? 0.0;
            if (!_canSpin) {
               _result = 'لقد استنفذت محاولتك اليوم!';
            }
          }
          if (rewardsRes.statusCode == 200) {
            _availableRewards = jsonDecode(rewardsRes.body);
          }
          _isLoadingStatus = false;
        });
      }
    } catch(e) {
      if (mounted) setState(() => _isLoadingStatus = false);
    }
  }

  String _formatTimer(double hours) {
    if (hours <= 0) return '00:00:00';
    int t = (hours * 3600).toInt();
    int h = t ~/ 3600;
    int m = (t % 3600) ~/ 60;
    int s = t % 60;
    return '${h.toString().padLeft(2,'0')}:${m.toString().padLeft(2,'0')}:${s.toString().padLeft(2,'0')}';
  }

  void _spin() async {
    if (_isSpinning) return;
    setState(() {
      _isSpinning = true;
      _result = 'تدوير...';
    });

    _controller.forward(from: 0).then((_) async {
      final response = await ApiService.post('/gamification/spin', {});
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        final prize = data['prize'];
        
        String winMessage = '';
        if (prize['reward_type'] == 'points') {
            winMessage = 'لقد ربحت ${prize['value']} نقطة مكافأة!';
        } else {
            winMessage = 'لقد ربحت ${prize['value']} من مقهى ${prize['cafe_name'] ?? 'الكافيه'}!';
        }

        setState(() {
          _result = winMessage;
          _isSpinning = false;
        });
      } else {
        String msg = 'عذراً، حدث خطأ ما';
        try {
           final body = jsonDecode(response.body);
           if (response.statusCode == 404 && body['message'] == 'No rewards available') {
              msg = 'عذراً، لا يوجد جوائز متاحة حالياً';
           }
        } catch(e) {}
        
        setState(() {
          _result = msg;
          _isSpinning = false;
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('عجلة الحظ', style: TextStyle(fontWeight: FontWeight.bold))),
      body: _isLoadingStatus 
        ? Center(child: CircularProgressIndicator())
        : Container(
        width: double.infinity,
        decoration: BoxDecoration(
          gradient: LinearGradient(
            colors: [Colors.white, Color(0xFFFAEDCD)],
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
          )
        ),
        child: SingleChildScrollView(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              SizedBox(height: 60),
              RotationTransition(
                turns: _animation,
                child: Container(
                  width: 300,
                  height: 300,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle, 
                    boxShadow: [BoxShadow(color: Colors.black26, blurRadius: 40, offset: Offset(0, 10))],
                    gradient: SweepGradient(colors: [
                      Color(0xFFD4A373), Color(0xFF3A5A40), 
                      Color(0xFFD4A373), Color(0xFFE9ECEF), 
                      Color(0xFF3A5A40), Color(0xFFD4A373)
                    ])
                  ),
                  child: Center(child: Icon(Icons.star, size: 60, color: Colors.white)),
                ),
              ),
              SizedBox(height: 40),
              Text(_result, style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF2B2D42)), textAlign: TextAlign.center),
              SizedBox(height: 20),
              if (!_canSpin)
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                  decoration: BoxDecoration(color: Colors.red.withOpacity(0.1), borderRadius: BorderRadius.circular(16)),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(Icons.timer_rounded, color: Colors.red),
                      SizedBox(width: 8),
                      Text('متبقي للمحاولة القادمة: ${_formatTimer(_hoursRemaining)}', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 16)),
                    ],
                  ),
                ),
              SizedBox(height: _canSpin ? 20 : 30),
              ElevatedButton(
                onPressed: (_isSpinning || !_canSpin) ? null : () { _spin(); },
                child: Text('جرب حظك الآن', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Color(0xFF3A5A40),
                  foregroundColor: Colors.white,
                  disabledBackgroundColor: Colors.grey,
                  padding: EdgeInsets.symmetric(horizontal: 50, vertical: 20),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  elevation: 10,
                ),
              ),
              SizedBox(height: 50),
              
              if (_availableRewards.isNotEmpty) ...[
                Padding(
                  padding: EdgeInsets.symmetric(horizontal: 24),
                  child: Row(children: [
                    Icon(Icons.card_giftcard, color: Color(0xFF3A5A40)),
                    SizedBox(width: 8),
                    Text('الجوائز المتاحة حالياً:', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Color(0xFF2B2D42))),
                  ]),
                ),
                SizedBox(height: 16),
                ListView.builder(
                  shrinkWrap: true,
                  physics: NeverScrollableScrollPhysics(),
                  padding: EdgeInsets.symmetric(horizontal: 20),
                  itemCount: _availableRewards.length,
                  itemBuilder: (context, index) {
                    final rew = _availableRewards[index];
                    return Card(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                      color: Colors.white.withOpacity(0.8),
                      elevation: 0,
                      child: ListTile(
                        leading: CircleAvatar(
                          backgroundColor: Color(0xFFD4A373).withOpacity(0.2),
                          child: Icon(rew['reward_type'] == 'points' ? Icons.stars : Icons.local_offer, color: Color(0xFFD4A373)),
                        ),
                        title: Text(rew['value'] + (rew['reward_type'] == 'points' ? ' نقطة' : ''), style: TextStyle(fontWeight: FontWeight.bold)),
                        subtitle: rew['reward_type'] != 'points' ? Text(rew['cafe_name'] ?? 'مقهى شريك') : null,
                      )
                    );
                  }
                ),
                SizedBox(height: 40),
              ]
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}
