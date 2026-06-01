# Grape Reverse 開発サーバー用 — Windows ファイアウォールで LAN からの接続を許可
# 管理者権限の PowerShell で実行: npm run dev:firewall

$ports = @(5000, 5001, 5173)
$rulePrefix = "Grape Reverse Vite Dev"
$failed = $false

foreach ($port in $ports) {
    $ruleName = "$rulePrefix (TCP $port)"
    $existing = Get-NetFirewallRule -DisplayName $ruleName -ErrorAction SilentlyContinue
    if ($existing) {
        Write-Host "OK (already exists): $ruleName"
        continue
    }
    try {
        New-NetFirewallRule `
            -DisplayName $ruleName `
            -Direction Inbound `
            -Protocol TCP `
            -LocalPort $port `
            -Action Allow `
            -Profile Private, Domain `
            -ErrorAction Stop | Out-Null
        Write-Host "OK (added): $ruleName"
    } catch {
        Write-Host "FAILED: $ruleName - $_" -ForegroundColor Red
        $failed = $true
    }
}

Write-Host ""
if ($failed) {
    Write-Host "Some rules failed. Run PowerShell as Administrator, then: npm run dev:firewall"
    exit 1
}
Write-Host "Done. Run npm run dev, then open the Network URL on your phone (same Wi-Fi)."
