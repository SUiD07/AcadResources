import { Heart, List } from "lucide-react";
import React from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import externImg from "../../assets/images/extern.jpg";
import timelineImg from "../../assets/images/timeline.jpg";
import NLE3Img from "../../assets/images/NLE3.png";

function CareerNavigationSection() {
  return (
    <>
      <div className="pb-20 lg:pb-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
            <h1 className="text-slate-900 text-[24px] font-bold">
              Career Navigation
            </h1>
          </div>
          <p className="text-slate-600 text-sm sm:text-base">
            Guidance and resources for your medical career journey
          </p>
        </div>
        {/* Special Thanks */}
        <div className="flex items-start gap-4 bg-pink-50 border border-pink-200 rounded-2xl p-6">
          <div className="w-10 h-10 bg-[#E5007D] rounded-full flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div>
            <p className="text-[#E5007D] font-semibold">Special Thanks</p>
            <p className="text-slate-600 mt-1">
              This section is being developed by{" "}
              <span className="font-semibold text-slate-800">
                P'Goody, MDCU 77
              </span>
              <div>
                Thank you for your dedication to helping every generation
                navigate their medical career with confidence.
              </div>
            </p>
          </div>
        </div>
        <br />
        <div>
          <div className="font-bold text-[24px]">กำหนดการสำคัญของ Extern</div>
          สรุปภาพรวม Timeline โดยอิงจากปี 2568 - 2569 เกี่ยวกับกำหนดการต่าง ๆ
          โดยสามารถดูรายละเอียดเพิ่มเติมได้ด้านล่าง แนะนำดูใน iPad or Com
          <div className="text-[#E5007D]">
            **กำหนดการนี้เป็นเพียงภาพรวมในปีที่ผ่านมา
            ไม่ใช่กำหนดการจริงที่จะเกิดขึ้น โปรดตรวจสอบอีกครั้ง
            ผ่านหน้าเว็บ/Facebook ของแต่ละสถาบัน โดยสามารถพิมพ์
            "สมัครแพทย์ใช้ทุน...สถาบันที่สนใจ....ปี..." เพื่อดูข้อมูลอีกครั้ง
            เนื่องจากแต่ละปีอาจไม่เหมือนกัน
          </div>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "1.25rem",
            }}
          >
            <li>
              บางสถาบันอาจเปิดหลายรอบ แต่ไม่ใช่ทุกรอบจะมีสาขาที่แต่ละคนสนใจ
              เนื่องจากรอบหลัง ๆ อาจเป็นการเก็บตก
            </li>
            <li>หลักฐาน/เอกสาร/แหล่งการขอเอกสารที่ควรรู้</li>
            <ul
              style={{
                listStyleType: "disc",
                paddingLeft: "1.25rem",
              }}
            >
              <li>เอกสารราชการ - บัตรประชาชน ทะเบียนบ้าน</li>
              <li>
                เอกสารการศึกษา เช่น Transcript สามารถขอได้จากสำนักการทะเบียนจุฬา
                ที่ลิ้งนี้
                <a target="_blank"
                href="https://web.reg.chula.ac.th/requestdocuments.html"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                  }}>https://web.reg.chula.ac.th/requestdocuments.html</a>
              </li>
              <li>คะแนนสอบภาษาอังกฤษ ตามแต่ละสถาบัน</li>
              <li>Portfolio / CV บางที่ให้ทำเป็นเล่ม บางที่อาจให้กรอกข้อมูล</li>
              <li>ใบ Recommendation</li>
              <li>เอกสารทางทหาร สด.8 / 9 (เฉพาะผู้ชาย) กรณีอยากเข้ากองทัพ</li>
            </ul>
          </ul>
        </div>
        <iframe
          src="https://script.google.com/a/macros/docchula.com/s/AKfycby57lgWeptmTCl6IZh7-tYRL48VLqovhALOE1UZfvSv13WHkH2SFm38IWreLmZXklXTUw/exec"
          width="100%"
          height="800"
        ></iframe>
        <br />
        <>
          <p className="font-bold">รายละเอียดเพิ่มเติม</p>
          <ul
            style={{
              listStyleType: "disc",
              paddingLeft: "1.25rem",
            }}
          >
            <li>
              การจัดหมวดในแต่ละสถาบัน จะแบ่งเป็นรายละเอียดตาม Post ของ สพท.
              สามารถศึกษาเพิ่มเติมได้
            </li>
            <ul
              style={{
                listStyleType: "disc",
                paddingLeft: "1.25rem",
              }}
            >
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                  href="https://www.facebook.com/AfterExtern/posts/pfbid02kBcY3niqC2NW1UoCGNKdfNWhgqw7suKyUikWiAkrFYuE9pt7QnWh8z987Fea7LcEl?rdid=x8J6qgfZojKx0twf#"
                >
                  แพทย์เพิ่มพูนทักษะ
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/AfterExtern/posts/pfbid02iShmmkzBDd8aotKAgRnrzUBpTApL45KuS8BQF8tTETnc9CH1GtiBrAjq9QvXyqCyl?rdid=di5URNU1ADiUehKd#"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                  }}
                >
                  จับสลากใช้ทุน
                </a>
              </li>
              <ul
                style={{
                  listStyleType: "disc",
                  paddingLeft: "1.25rem",
                }}
              >
                <li>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "underline",
                    }}
                    href="https://drive.google.com/drive/folders/1uExsvNaxKryyAS1HsiEWwUrjj8DGnMJP"
                  >
                    เอกสารจากกระทรวง ประจำปี 2569
                  </a>
                </li>
              </ul>
              <li>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                  }}
                  href="https://www.facebook.com/AfterExtern/posts/pfbid035y5qBDiqZyqNoG7hDkYrh17PawWprdqBJFpstHuHLQw8JRrgao5BreR3YPhnysqLl?rdid=Ybj2Vy43T5OvtNIk#"
                >
                  แพทย์พี่เลี้ยง
                </a>
              </li>
              <ul
                style={{
                  listStyleType: "disc",
                  paddingLeft: "1.25rem",
                }}
              >
                <li>
                  เว็บไซต์ส่วนกลาง:{" "}
                  <a
                    href="https://icpird.moph.go.th/contributordr/Default.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: "#2563eb",
                      textDecoration: "underline",
                    }}
                  >
                    https://icpird.moph.go.th/contributordr/Default.aspx
                  </a>
                </li>
              </ul>
              <li>
                <a
                  href="https://www.facebook.com/AfterExtern/posts/pfbid02Bu6aUr35NDPu4vJ1e7rcCP2jRJ1rAFZjzKYczEMrVDiecm6YpPJTD7JbgEfdCdF7l?rdid=FgpUcE6C9QUOFrRM#"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: "#2563eb",
                    textDecoration: "underline",
                  }}
                >
                  ใช้ทุนโรงเรียนแพทย์
                </a>
              </li>
              <ul
                style={{
                  listStyleType: "disc",
                  paddingLeft: "1.25rem",
                }}
              >
                <li>กลุ่มโรงเรียนแพทย์ขนาดใหญ่</li>
                <li>กลุ่มโรงเรียนแพทย์หลักส่วนภูมิภาค (มช, มอ, มข, มน)</li>
                <li>กลุ่มโรงเรียนแพทย์เปิดใหม่</li>
              </ul>
            </ul>
          </ul>
        </>
        <br />

        {/* Extern Image */}
        <div className="flex justify-center my-4">
          <ImageWithFallback
            src={externImg}
            alt="Extern Schedule"
            className="h-auto rounded-lg object-contain border-2 border-slate-200"
            style={{ maxWidth: "600px", width: "100%" }}
          />
        </div>
        <p className="text-center text-sm text-slate-600 mb-6">
          Credit: Extern MDCU-BB32 & FB จบ extern แล้วไปไหนดี
        </p>

        {/* Timeline Image */}
        <div className="flex justify-center my-4">
          <ImageWithFallback
            src={timelineImg}
            alt="Extern Timeline"
            className="h-auto rounded-lg object-contain border-2 border-slate-200"
            style={{ maxWidth: "600px", width: "100%" }}
          />
        </div>
        <br />

        {/* Specialization Distribution */}
        <div className="font-bold text-[24px]">
          จำนวนการรับสาขาเรียนต่อในแต่ละจังหวัดและสาขาของปี 2568
        </div>
        <p className="text-slate-600 mb-4">
          เว็บไซต์ เลือกเมนู "พื้นที่เรียนต่อ" อ้างอิงจากประกาศแพทยสภา
        </p>
        <div className="overflow-x-auto">
          <iframe
            src="https://script.google.com/a/macros/docchula.com/s/AKfycbzLW3UuSljfe5tDJghzfOvfBgh-k9yrm_RNwQ12myPPk1Ti4Td9g6RDosFZeTUxVGeaMw/exec"
            width="100%"
            height="800"
          ></iframe>
        </div>
        <br />

        {/* NLE3 Section */}
        <div className="font-bold text-[24px] mb-4">NLE 3</div>
        <div className="overflow-x-auto mb-4">
          <iframe
            src="https://cmathai.org/news/detail/974"
            width="100%"
            height="600"
          ></iframe>
        </div>

        {/* NLE3 Image */}
        <div className="flex justify-center my-4">
          <ImageWithFallback
            src={NLE3Img}
            alt="NLE3"
            className="h-auto rounded-lg object-contain border-2 border-slate-200"
            style={{ maxWidth: "600px", width: "100%" }}
          />
        </div>
      </div>
    </>
  );
}

export default CareerNavigationSection;
