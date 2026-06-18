import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import BrandMark from '../../components/ui/BrandMark';
import { ArrowRight, CheckCircle2, Lock, Mail, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Preencha todos os campos');
      return;
    }
    setLoading(true);
    try {
      const loggedUser = await login(email.trim(), password);
      toast.success('Login realizado com sucesso!');
      navigate(loggedUser.role === 'admin' ? '/dashboard' : '/morador');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="auth-grid relative hidden min-h-screen overflow-hidden bg-[#111827] bg-[linear-gradient(135deg,rgba(37,99,235,0.22),transparent_42%,rgba(16,185,129,0.16))] p-10 lg:flex lg:flex-col xl:p-14">
        <div className="relative z-10">
          <BrandMark inverted />
        </div>

        <div className="relative z-10 my-auto max-w-xl py-16">
          <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-bold text-blue-200">
            <Sparkles className="h-3.5 w-3.5" />
            Gestão condominial sem ruído
          </div>
          <h1 className="max-w-lg text-5xl font-extrabold leading-[1.08] text-white xl:text-6xl">
            Gestão simples.
            <span className="block bg-gradient-to-r from-blue-300 to-indigo-300 bg-clip-text text-transparent">
              Operação profissional.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-base font-medium leading-7 text-slate-400">
            Centralize cobranças, moradores, comunicados e reservas em uma experiência clara para quem administra e para quem mora.
          </p>

          <div className="mt-10 grid grid-cols-2 gap-3">
            {['Financeiro organizado', 'Comunicação centralizada', 'Rotinas mais rápidas', 'Acesso seguro'].map((item) => (
              <div key={item} className="flex items-center gap-2.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3.5 py-3 text-sm font-semibold text-slate-300 backdrop-blur">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 text-xs font-semibold text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          Dados protegidos e acesso individual por perfil
        </div>
      </section>

      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#f5f7fb] bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(241,245,249,0.78)),linear-gradient(90deg,rgba(15,23,42,0.035)_1px,transparent_1px),linear-gradient(rgba(15,23,42,0.035)_1px,transparent_1px)] bg-[size:auto,34px_34px,34px_34px] px-5 py-10 sm:px-10">
        <div className="relative w-full max-w-[460px] animate-fade-in">
          <div className="mb-8 flex justify-center lg:hidden">
            <BrandMark />
          </div>

          <div className="rounded-lg border border-white bg-white/95 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.11)] ring-1 ring-slate-200/70 backdrop-blur sm:p-9">
            <div className="mb-8">
              <p className="eyebrow mb-3">Acesso à plataforma</p>
              <h2 className="text-3xl font-extrabold text-slate-950">Bem-vindo de volta</h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">Entre com suas credenciais para acessar sua gestão.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                autoComplete="email"
              />
              <Input
                label="Senha"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
              />
              <Button type="submit" loading={loading} className="w-full" size="lg" icon={!loading ? <ArrowRight className="h-4 w-4" /> : undefined}>
                Entrar na plataforma
              </Button>
            </form>

            <div className="my-7 h-px bg-slate-100" />

            <p className="text-center text-sm font-medium text-slate-500">
              Ainda não tem conta?{' '}
              <Link to="/cadastro" className="font-extrabold text-blue-600 transition-colors hover:text-blue-700">
                Comece gratuitamente
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;
