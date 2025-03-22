import React from 'react';

export default function InfoTerminal() {
    return (
        <div className="info-terminal">
      <div className="container mx-auto p-6">
        {/* Section 1 */}
        <div className="section-1 mb-12">
          <h2 className="text-2xl font-bold mb-4">Section 1 Title</h2>
          <p>
            นี่คือเนื้อหาของ Section 1 ซึ่งสามารถใส่ข้อมูลหรือองค์ประกอบต่าง ๆ ที่เกี่ยวข้องกับ InfoTerminal ที่คุณต้องการแสดง.
          </p>

        </div>

        {/* Section 2 */}
        <div className="section-2">
          <h2 className="text-2xl font-bold mb-4">Section 2 Title</h2>
          <p>
            นี่คือเนื้อหาของ Section 2 ซึ่งเป็นส่วนที่ 2 ของหน้า InfoTerminal ที่สามารถใส่ข้อมูลเพิ่มเติมหรือฟังก์ชันอื่น ๆ เช่น ฟอร์ม, แผนที่, หรือรายละเอียดเพิ่มเติมที่สำคัญ.
          </p>

        </div>
      </div>
    </div>
  );
}