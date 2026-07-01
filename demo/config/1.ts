import { execFile } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

function runPowerShellScript(scriptContent: string, args: string[] = []): Promise<string> {
  return new Promise((resolve, reject) => {
    const scriptPath = join(tmpdir(), `dpapi_${Date.now()}.ps1`);
    writeFileSync(scriptPath, scriptContent, 'utf8');
    const cmdArgs = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', scriptPath, ...args];

    execFile('powershell', cmdArgs, { encoding: 'utf8' }, (error, stdout, stderr) => {
      try { unlinkSync(scriptPath); } catch {}
      if (error) {
        reject(new Error(`PowerShell failed: ${stderr || error.message}`));
        return;
      }
      resolve(stdout);
    });
  });
}

/**
 * 使用 PowerShell 调用 Windows DPAPI 进行加密
 * @param plainStr 明文字符串
 * @param entropyStr 可选的熵值（盐）
 * @returns Base64 编码的密文
 */
export async function encrypt(plainStr: string, entropyStr: string | null = null): Promise<string> {
  const script = `
    param([string]$Plain, [string]$Entropy)
    [Reflection.Assembly]::LoadWithPartialName("System.Security") | Out-Null
    $plainBytes = [System.Text.Encoding]::UTF8.GetBytes($Plain)
    $scope = [System.Security.Cryptography.DataProtectionScope]::CurrentUser
    $entropyBytes = $null
    if ($Entropy -ne "") {
        $entropyBytes = [System.Text.Encoding]::UTF8.GetBytes($Entropy)
    }
    $protected = [System.Security.Cryptography.ProtectedData]::Protect($plainBytes, $entropyBytes, $scope)
    [Convert]::ToBase64String($protected)
  `;
  const stdout = await runPowerShellScript(script, ['-Plain', plainStr, '-Entropy', entropyStr || '']);
  return stdout.trim();
}

/**
 * 使用 PowerShell 调用 Windows DPAPI 进行解密
 * @param encB64 Base64 编码的密文
 * @param entropyStr 可选的熵值（盐），必须与加密时一致
 * @returns 明文字符串
 */
export async function decrypt(encB64: string, entropyStr: string | null = null): Promise<string> {
  const script = `
    param([string]$EncB64, [string]$Entropy)
    [Reflection.Assembly]::LoadWithPartialName("System.Security") | Out-Null
    $protectedBytes = [Convert]::FromBase64String($EncB64)
    $scope = [System.Security.Cryptography.DataProtectionScope]::CurrentUser
    $entropyBytes = $null
    if ($Entropy -ne "") {
        $entropyBytes = [System.Text.Encoding]::UTF8.GetBytes($Entropy)
    }
    $plainBytes = [System.Security.Cryptography.ProtectedData]::Unprotect($protectedBytes, $entropyBytes, $scope)
    [System.Text.Encoding]::UTF8.GetString($plainBytes)
  `;
  const stdout = await runPowerShellScript(script, ['-EncB64', encB64, '-Entropy', entropyStr || '']);
  return stdout.trim();
}

// 测试
(async () => {
  const secret = 'MyPassword@123456';
  const entropy = 'MySalt123';

  console.log('原始明文:', secret);

  const enc = await encrypt(secret, entropy);
  console.log('加密结果(Base64):', enc);

  const dec = await decrypt(enc, entropy);
  console.log('解密明文:', dec);

  if (dec === secret) {
    console.log('✅ 加解密测试通过');
  } else {
    console.log('❌ 加解密测试失败');
  }
})();
