/**
 * 🏫 숭실중학교 영어 RPG - 학생 계정 & 평문 PIN 양방향 연동 스크립트
 * 대상 스프레드시트: https://docs.google.com/spreadsheets/d/1r-fa5wMoNLPLQX3j3dfo75UEzOkPPApaUD46yOtCwk4/edit
 *
 * [설치 및 배포 방법]
 * 1. 위 구글 스프레드시트 상단 메뉴 [확장 프로그램] -> [Apps Script] 클릭
 * 2. 기존 코드를 모두 지우고 이 코드 전체를 붙여넣기 후 저장(Ctrl+S)
 * 3. 상단 함수 선택에서 `setupStudentSheet` 선택 -> [실행] 클릭하여 권한 허용 & '학생계정' 시트 서식 생성
 * 4. 우측 상단 [배포] -> [새 배포] -> 유형: [웹 앱]
 *    - 다음 사용자 권한으로 실행: [나]
 *    - 액세스 권한이 있는 사용자: [모든 사용자]
 *    -> [배포] 클릭 후 발급된 웹 앱 URL(.../exec)을 게임 내 교사 관리자 화면에 입력!
 */

const SPREADSHEET_ID = '1r-fa5wMoNLPLQX3j3dfo75UEzOkPPApaUD46yOtCwk4';
const SHEET_NAME = '학생계정';
const SYNC_SECRET = ''; // 선택사항: 교사 관리자 화면과 동일한 보안키를 입력하면 인증을 검사합니다.

const HEADERS = ['학번', '이름', '이메일', 'PIN', '레벨', '골드', '등록일시', '최근접속'];

function onOpen() {
  try {
    SpreadsheetApp.getUi()
      .createMenu('🏫 숭실RPG 계정 시트')
      .addItem('✨ 학생계정 시트 초기 서식 만들기', 'setupStudentSheet')
      .addToUi();
  } catch (e) {}
}

function getSpreadsheet_() {
  try {
    const active = SpreadsheetApp.getActiveSpreadsheet();
    if (active && active.getId() === SPREADSHEET_ID) return active;
  } catch (e) {}
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function ensureStudentSheet_() {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(SHEET_NAME);
  let created = false;
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    created = true;
  }
  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  const hasHeader = String(firstRow[0] || '').trim() === '학번';
  if (created || !hasHeader) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
    const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
    headerRange
      .setBackground('#0f172a')
      .setFontColor('#ffffff')
      .setFontWeight('bold')
      .setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 95);  // 학번
    sheet.setColumnWidth(2, 100); // 이름
    sheet.setColumnWidth(3, 210); // 이메일
    sheet.setColumnWidth(4, 90);  // PIN
    sheet.setColumnWidth(5, 70);  // 레벨
    sheet.setColumnWidth(6, 85);  // 골드
    sheet.setColumnWidth(7, 165); // 등록일시
    sheet.setColumnWidth(8, 165); // 최근접속
  }
  // 학번(A)과 PIN(D) 열은 앞자리 0(예: 0322, 01010) 보존을 위해 반드시 일반 텍스트(@) 서식 유지
  const maxRows = Math.max(sheet.getMaxRows(), 200);
  sheet.getRange(2, 1, maxRows - 1, 1).setNumberFormat('@');
  sheet.getRange(2, 4, maxRows - 1, 1).setNumberFormat('@');
  return sheet;
}

function setupStudentSheet() {
  const sheet = ensureStudentSheet_();
  try {
    sheet.getRange('D1').setNote('4자리 숫자 PIN이 평문으로 표시됩니다.\n이 칸의 숫자를 4자리로 바꾸면 학생 로그인 시 새 PIN으로 자동 반영됩니다.\nPIN을 비우게 하려면 "초기화" 라고 입력하세요.');
  } catch (e) {}
  return { success: true, sheetName: sheet.getName() };
}

function normalizeTextCell_(val) {
  return String(val === undefined || val === null ? '' : val).trim();
}

function readAllStudentRows_(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  const displayValues = sheet.getRange(2, 1, lastRow - 1, HEADERS.length).getDisplayValues();
  const list = [];
  for (let i = 0; i < displayValues.length; i++) {
    const r = displayValues[i];
    const sid = normalizeTextCell_(r[0]);
    if (!sid || sid === '학번') continue;
    list.push({
      rowNumber: i + 2,
      studentId: sid,
      name: normalizeTextCell_(r[1]),
      email: normalizeTextCell_(r[2]).toLowerCase(),
      pin: normalizeTextCell_(r[3]),
      level: Number(r[4]) || 1,
      gold: Number(r[5]) || 0,
      registeredAt: normalizeTextCell_(r[6]),
      updatedAt: normalizeTextCell_(r[7])
    });
  }
  return list;
}

function verifySecret_(payloadSecret) {
  const configured = normalizeTextCell_(
    (PropertiesService.getScriptProperties().getProperty('SYNC_SECRET')) || SYNC_SECRET
  );
  if (!configured) return true;
  return normalizeTextCell_(payloadSecret) === configured;
}

function jsonOut_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const params = (e && e.parameter) || {};
  if (!verifySecret_(params.secret)) {
    return jsonOut_({ success: false, error: '인증 비밀키가 일치하지 않습니다.' });
  }
  const action = normalizeTextCell_(params.action || 'getAll');
  const sheet = ensureStudentSheet_();

  if (action === 'ping') {
    return jsonOut_({ success: true, sheetName: SHEET_NAME, spreadsheetId: SPREADSHEET_ID });
  }
  if (action === 'getOne') {
    const sid = normalizeTextCell_(params.studentId);
    const rows = readAllStudentRows_(sheet);
    const hit = rows.find(r => r.studentId === sid) || null;
    return jsonOut_({ success: true, found: !!hit, row: hit });
  }
  const rows = readAllStudentRows_(sheet);
  return jsonOut_({ success: true, sheetName: SHEET_NAME, rows: rows });
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let body = {};
    if (e && e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    }
    if (!verifySecret_(body.secret)) {
      return jsonOut_({ success: false, error: '인증 비밀키가 일치하지 않습니다.' });
    }

    const action = normalizeTextCell_(body.action || 'getAll');
    const sheet = ensureStudentSheet_();

    if (action === 'ping') {
      return jsonOut_({ success: true, sheetName: SHEET_NAME, spreadsheetId: SPREADSHEET_ID });
    }

    if (action === 'getAll') {
      return jsonOut_({ success: true, sheetName: SHEET_NAME, rows: readAllStudentRows_(sheet) });
    }

    if (action === 'getOne') {
      const sid = normalizeTextCell_(body.studentId);
      const rows = readAllStudentRows_(sheet);
      const hit = rows.find(r => r.studentId === sid) || null;
      return jsonOut_({ success: true, found: !!hit, row: hit });
    }

    if (action === 'upsertOne') {
      const row = body.row || {};
      const sid = normalizeTextCell_(row.studentId);
      if (!sid) return jsonOut_({ success: false, error: '학번이 필요합니다.' });
      const rows = readAllStudentRows_(sheet);
      const existing = rows.find(r => r.studentId === sid);
      const resolvedPin = row.clearPin ? '' : (normalizeTextCell_(row.pin) || (existing ? existing.pin : ''));
      const line = [
        sid,
        normalizeTextCell_(row.name) || (existing ? existing.name : ''),
        normalizeTextCell_(row.email).toLowerCase() || (existing ? existing.email : ''),
        resolvedPin,
        Number(row.level) || (existing ? existing.level : 1),
        row.gold !== undefined ? Number(row.gold) : (existing ? existing.gold : 10),
        normalizeTextCell_(row.registeredAt) || (existing ? existing.registeredAt : ''),
        normalizeTextCell_(row.updatedAt) || (existing ? existing.updatedAt : '')
      ];
      if (existing) {
        const range = sheet.getRange(existing.rowNumber, 1, 1, HEADERS.length);
        sheet.getRange(existing.rowNumber, 1).setNumberFormat('@');
        sheet.getRange(existing.rowNumber, 4).setNumberFormat('@');
        range.setValues([line]);
      } else {
        const targetRow = Math.max(sheet.getLastRow() + 1, 2);
        sheet.getRange(targetRow, 1).setNumberFormat('@');
        sheet.getRange(targetRow, 4).setNumberFormat('@');
        sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues([line]);
      }
      return jsonOut_({ success: true, studentId: sid });
    }

    if (action === 'syncAll') {
      const incomingRows = Array.isArray(body.rows) ? body.rows : [];
      const existingRows = readAllStudentRows_(sheet);
      const existingMap = {};
      existingRows.forEach(r => { existingMap[r.studentId] = r; });

      const appendList = [];
      let updatedCount = 0;

      for (let i = 0; i < incomingRows.length; i++) {
        const row = incomingRows[i] || {};
        const sid = normalizeTextCell_(row.studentId);
        if (!sid) continue;
        const ex = existingMap[sid];
        const pinVal = row.clearPin ? '' : (normalizeTextCell_(row.pin) || (ex ? ex.pin : ''));
        const line = [
          sid,
          normalizeTextCell_(row.name) || (ex ? ex.name : ''),
          normalizeTextCell_(row.email).toLowerCase() || (ex ? ex.email : ''),
          pinVal,
          Number(row.level) || (ex ? ex.level : 1),
          row.gold !== undefined ? Number(row.gold) : (ex ? ex.gold : 10),
          normalizeTextCell_(row.registeredAt) || (ex ? ex.registeredAt : ''),
          normalizeTextCell_(row.updatedAt) || (ex ? ex.updatedAt : '')
        ];
        if (ex) {
          sheet.getRange(ex.rowNumber, 1).setNumberFormat('@');
          sheet.getRange(ex.rowNumber, 4).setNumberFormat('@');
          sheet.getRange(ex.rowNumber, 1, 1, HEADERS.length).setValues([line]);
          updatedCount++;
        } else {
          appendList.push(line);
        }
      }

      if (appendList.length > 0) {
        const startRow = Math.max(sheet.getLastRow() + 1, 2);
        sheet.getRange(startRow, 1, appendList.length, 1).setNumberFormat('@');
        sheet.getRange(startRow, 4, appendList.length, 1).setNumberFormat('@');
        sheet.getRange(startRow, 1, appendList.length, HEADERS.length).setValues(appendList);
      }

      return jsonOut_({
        success: true,
        updatedCount: updatedCount,
        appendedCount: appendList.length,
        totalCount: updatedCount + appendList.length
      });
    }

    if (action === 'deleteOne') {
      const sid = normalizeTextCell_(body.studentId);
      const rows = readAllStudentRows_(sheet);
      const existing = rows.find(r => r.studentId === sid);
      if (existing) {
        sheet.deleteRow(existing.rowNumber);
      }
      return jsonOut_({ success: true, deleted: !!existing });
    }

    return jsonOut_({ success: false, error: '알 수 없는 action 입니다: ' + action });
  } catch (err) {
    return jsonOut_({ success: false, error: err && err.message ? err.message : String(err) });
  } finally {
    lock.releaseLock();
  }
}
