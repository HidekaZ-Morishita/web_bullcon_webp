<?php
/**
 * 採用お問い合わせフォーム 送信処理
 * 
 * 送信先: bullcon_recruit@fuji-denki.co.jp
 */

// セッション開始（CSRF対策やエラーメッセージ保持用など、必要に応じて拡張可能）
session_start();

// フォームから送信されたデータの取得
$naiyou = isset($_POST['naiyou']) ? $_POST['naiyou'] : '';
$job_type = isset($_POST['job_type']) ? $_POST['job_type'] : '';
$name = isset($_POST['name']) ? $_POST['name'] : '';
$kana = isset($_POST['kana']) ? $_POST['kana'] : '';
$zip = isset($_POST['zip']) ? $_POST['zip'] : '';
$address = isset($_POST['adress']) ? $_POST['adress'] : ''; // HTML側がadressになっているため合わせる
$tel = isset($_POST['tel']) ? $_POST['tel'] : '';
$mailaddress = isset($_POST['mailaddress']) ? $_POST['mailaddress'] : '';

// --- バリデーション ---
$errors = [];

if (empty($naiyou)) {
    $errors[] = 'お問い合わせ項目を選択してください。';
}
if (empty($job_type)) {
    $errors[] = '希望職種を選択してください。';
}
if (empty($name)) {
    $errors[] = 'お名前を入力してください。';
}
if (empty($kana)) {
    $errors[] = 'フリガナを入力してください。';
} elseif (!preg_match('/^[ァ-ヶー\s]+$/u', $kana)) {
    $errors[] = 'フリガナは全角カタカナで入力してください。';
}
if (empty($zip)) {
    $errors[] = '郵便番号を入力してください。';
} elseif (!preg_match('/^\d{7}$/', $zip)) {
    $errors[] = '郵便番号はハイフンなしの7桁で入力してください。';
}
if (empty($address)) {
    $errors[] = 'ご住所を入力してください。';
}
if (empty($tel)) {
    $errors[] = '電話番号を入力してください。';
}
if (empty($mailaddress)) {
    $errors[] = 'メールアドレスを入力してください。';
} elseif (!filter_var($mailaddress, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'メールアドレスの形式が正しくありません。';
}

// エラーがある場合は元に戻る（簡易的な実装。実際は前の入力値を保持するなどの処理が望ましい）
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
$to = 'bullcon_recruit@fuji-denki.co.jp'; // 本番アドレス
$subject = "【採用お問い合わせ】{$job_type} / {$name}様より";

$body = "採用お問い合わせフォームより以下の内容で送信されました。\n\n";
$body .= "--------------------------------------------------\n";
$body .= "お問い合わせ項目: {$naiyou}\n";
$body .= "希望職種: {$job_type}\n";
$body .= "お名前: {$name}\n";
$body .= "フリガナ: {$kana}\n";
$body .= "郵便番号: {$zip}\n";
$body .= "ご住所: {$address}\n";
$body .= "電話番号: {$tel}\n";
$body .= "メールアドレス: {$mailaddress}\n";
$body .= "--------------------------------------------------\n\n";
$body .= "備考・自己PR:\n" . (isset($_POST['opinion']) ? $_POST['opinion'] : '') . "\n";

mb_language("uni");
mb_internal_encoding("UTF-8");

// ヘッダーの設定
$headers = "From: " . mb_encode_mimeheader("Bullcon採用フォーム", "UTF-8", "B") . " <{$mailaddress}>\r\n";
$headers .= "Reply-To: {$mailaddress}\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// メール送信実行
if (mb_send_mail($to, $subject, $body, $headers)) {

    // --- お客様への自動返信メール ---
    $auto_subject = "【Bullcon】採用お問い合わせを受け付けました";

    $auto_body = "{$name} 様\n\n";
    $auto_body .= "この度は採用についてお問い合わせいただきありがとうございます。\n";
    $auto_body .= "以下の内容で受け付けいたしました。\n\n";
    $auto_body .= "--------------------------------------------------\n";
    $auto_body .= "お問い合わせ項目: {$naiyou}\n";
    $auto_body .= "希望職種: {$job_type}\n";
    $auto_body .= "お名前: {$name}\n";
    $auto_body .= "フリガナ: {$kana}\n";
    $auto_body .= "郵便番号: {$zip}\n";
    $auto_body .= "ご住所: {$address}\n";
    $auto_body .= "電話番号: {$tel}\n";
    $auto_body .= "メールアドレス: {$mailaddress}\n";
    $auto_body .= "--------------------------------------------------\n\n";
    $auto_body .= "担当者より改めてご連絡いたしますので、しばらくお待ちください。\n\n";
    $auto_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $auto_body .= "株式会社富士電機株式会社 Bullcon 採用担当\n";
    $auto_body .= "E-mail: bullcon_recruit@fuji-denki.co.jp\n";
    $auto_body .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n";
    $auto_body .= "※このメールは自動送信されています。このメールへの返信はできません。\n";

    $auto_headers = "From: " . mb_encode_mimeheader("Bullcon採用担当", "UTF-8", "B") . " <bullcon_recruit@fuji-denki.co.jp>\r\n";
    $auto_headers .= "Reply-To: bullcon_recruit@fuji-denki.co.jp\r\n";
    $auto_headers .= "MIME-Version: 1.0\r\n";
    $auto_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    $auto_headers .= "Content-Transfer-Encoding: 8bit\r\n";
    $auto_headers .= "X-Mailer: PHP/" . phpversion();

    mb_send_mail($mailaddress, $auto_subject, $auto_body, $auto_headers);

    // 成功時：サンクスページへ遷移
    header("Location: ../../html/contact/thanks_recruit.html");
    exit;
} else {
    // 失敗時
    echo "メールの送信に失敗しました。時間をおいて再度お試しいただくか、お電話でお問い合わせください。";
    exit;
}
