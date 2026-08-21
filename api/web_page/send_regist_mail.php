<?php
/**
 * 閲覧ID登録申請フォーム 送信処理
 * 
 * 送信先: touroku@fuji-denki.co.jp
 */

session_start();

// フォームから送信されたデータの取得
$name = isset($_POST['name']) ? $_POST['name'] : '';
$kana = isset($_POST['kana']) ? $_POST['kana'] : '';
$applicant = isset($_POST['name2']) ? $_POST['name2'] : '';
$zip = isset($_POST['zip']) ? $_POST['zip'] : '';
$address = isset($_POST['adress']) ? $_POST['adress'] : '';
$tel = isset($_POST['tel']) ? $_POST['tel'] : '';
$route = isset($_POST['route']) ? $_POST['route'] : '';
$mailaddress = isset($_POST['mailaddress']) ? $_POST['mailaddress'] : '';

// --- バリデーション ---
$errors = [];

if (empty($name)) {
    $errors[] = '店舗名（法人名）を入力してください。';
}
if (empty($kana)) {
    $errors[] = '店舗名（フリガナ）を入力してください。';
} elseif (!preg_match('/^[ァ-ヶー\s]+$/u', $kana)) {
    $errors[] = 'フリガナは全角カタカナで入力してください。';
}
if (empty($applicant)) {
    $errors[] = '申請者名を入力してください。';
}
if (empty($zip)) {
    $errors[] = '郵便番号を入力してください。';
} elseif (!preg_match('/^\d{7}$/', $zip)) {
    $errors[] = '郵便番号はハイフンなしの7桁で入力してください。';
}
if (empty($address)) {
    $errors[] = 'ご住所を入力してください。';
}
if (empty($route)) {
    $errors[] = '製品の仕入先名を記入してください。';
}
if (empty($mailaddress)) {
    $errors[] = 'メールアドレスを入力してください。';
} elseif (!filter_var($mailaddress, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'メールアドレスの形式が正しくありません。';
}

if (!empty($errors)) {
    echo "<h1>入力エラーがあります</h1><ul>";
    foreach ($errors as $error) {
        echo "<li>" . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . "</li>";
    }
    echo "</ul><a href='javascript:history.back()'>戻る</a>";
    exit;
}

// --- メール送信設定 ---
//$to = 'taku-yamaoka@fuji-denki.co.jp'; // 仮のアドレス
$to = 'touroku@fuji-denki.co.jp'; // 本番アドレス
$subject = "【ID登録申請】{$name}様より";

$body = "閲覧ID登録申請フォームより以下の内容で送信されました。\n\n";
$body .= "--------------------------------------------------\n";
$body .= "店舗名（法人名）: {$name}\n";
$body .= "店舗名（フリガナ）: {$kana}\n";
$body .= "申請者名: {$applicant}\n";
$body .= "郵便番号: {$zip}\n";
$body .= "ご住所: {$address}\n";
$body .= "電話番号: {$tel}\n";
$body .= "製品の仕入先名: {$route}\n";
$body .= "メールアドレス: {$mailaddress}\n";
$body .= "--------------------------------------------------\n\n";

mb_language("uni");
mb_internal_encoding("UTF-8");

$headers = "From: " . mb_encode_mimeheader("Bullcon登録申請", "UTF-8", "B") . " <{$mailaddress}>\r\n";
$headers .= "Reply-To: {$mailaddress}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

if (mb_send_mail($to, $subject, $body, $headers)) {

    // --- お客様への自動返信メール ---
    $auto_subject = "【Bullcon】ID登録申請を受け付けました";

    $auto_body = "{$name} 様\n\n";
    $auto_body .= "この度は閲覧ID登録のお申請ありがとうございます。\n";
    $auto_body .= "以下の内容で受け付けいたしました。\n\n";
    $auto_body .= "--------------------------------------------------\n";
    $auto_body .= "店舗名（法人名）: {$name}\n";
    $auto_body .= "店舗名（フリガナ）: {$kana}\n";
    $auto_body .= "申請者名: {$applicant}\n";
    $auto_body .= "郵便番号: {$zip}\n";
    $auto_body .= "ご住所: {$address}\n";
    $auto_body .= "電話番号: {$tel}\n";
    $auto_body .= "製品の仕入先名: {$route}\n";
    $auto_body .= "メールアドレス: {$mailaddress}\n";
    $auto_body .= "--------------------------------------------------\n\n";
    $auto_body .= "内容を確認の上、担当者より改めてご連絡いたします。しばらくお待ちください。\n\n";
    $auto_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $auto_body .= "Bullcon ID登録申請窓口\n";
    $auto_body .= "E-mail: touroku@fuji-denki.co.jp\n";
    $auto_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $auto_body .= "※このメールは自動送信されています。このメールへの返信はできません。\n";

    $auto_headers = "From: " . mb_encode_mimeheader("BullconID登録申請窓口", "UTF-8", "B") . " <touroku@fuji-denki.co.jp>\r\n";
    $auto_headers .= "Reply-To: touroku@fuji-denki.co.jp\r\n";
    $auto_headers .= "MIME-Version: 1.0\r\n";
    $auto_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $auto_headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $auto_headers .= "X-Mailer: PHP/" . phpversion();

    mb_send_mail($mailaddress, $auto_subject, $auto_body, $auto_headers);

    // 成功時：既存のthanksがあれば活用、なければ新規作成
    header("Location: ../../html/contact/thanks.html");
    exit;
} else {
    echo "メールの送信に失敗しました。時間をおいて再度お試しいただくか、お電話でお問い合せください。";
    exit;
}
