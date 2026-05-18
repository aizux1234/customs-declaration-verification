import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { MAX_ATTEMPTS } from '../../api/authApi';
import { landingRoute } from '../../utils/permissions';
import { TextInput } from '../../components/TextInput';
import { PasswordInput } from '../../components/PasswordInput';
import { Button } from '../../components/Button';
import { Alert } from '../../components/Alert';

const APP_VERSION = 'เวอร์ชัน 1.0';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = username.trim() !== '' && password !== '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || loading) return;

    setLoading(true);
    setError(null);
    try {
      const result = await signIn(username, password);
      if (result.ok) {
        navigate(landingRoute(result.user.role));
        return;
      }
      if (result.reason === 'LOCKED') {
        setError('บัญชีถูกล็อก กรุณาติดต่อผู้ดูแลระบบ');
      } else if (result.reason === 'INACTIVE') {
        setError('บัญชีนี้ถูกปิดใช้งาน');
      } else if (result.reason === 'INVALID' && result.attemptsLeft < MAX_ATTEMPTS) {
        setError(
          `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง เหลือ ${result.attemptsLeft} ครั้ง ก่อนบัญชีจะถูกล็อก`,
        );
      } else {
        setError('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-navy-700 text-white shadow-card">
          <ShieldCheck size={28} strokeWidth={2} />
        </div>
        <h1 className="text-xl font-semibold text-navy-800">
          ระบบตรวจสอบข้อมูลใบขน
        </h1>
        <p className="mt-1 text-sm text-navy-500">
          Verify Export Risk Intelligent
        </p>
        <p className="mt-3 text-sm text-navy-500">
          กรุณาเข้าสู่ระบบเพื่อใช้งาน
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <TextInput
          label="Username / ชื่อผู้ใช้"
          value={username}
          onChange={setUsername}
          required
          placeholder="กรอกชื่อผู้ใช้"
        />
        <PasswordInput
          label="Password / รหัสผ่าน"
          value={password}
          onChange={setPassword}
          required
          placeholder="กรอกรหัสผ่าน"
        />

        {error && (
          <Alert tone="error" variant="inline">
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!canSubmit}
          className="w-full"
        >
          เข้าสู่ระบบ
        </Button>

        <button
          type="button"
          disabled
          title="ฟังก์ชันนี้ยังไม่เปิดใช้งาน"
          className="self-center text-xs text-navy-400 underline disabled:cursor-not-allowed"
        >
          ลืมรหัสผ่าน?
        </button>
      </form>

      <p className="mt-8 text-center text-xs text-navy-400">{APP_VERSION}</p>
    </div>
  );
}
