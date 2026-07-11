import { sendTelegram } from './telegram.service';
import {
  CATHETER_CRITICAL_LOW_ML,
  FEVER_C,
  HIGH_FEVER_C,
  CRITICAL_SPO2_PCT,
  TACHYCARDIA_BPM,
  type CatheterInput,
  type CheckInput,
} from '@arob/shared';

function alertMessage(lines: string[]): string {
  return `🏥 نظام متابعة عروب\n━━━━━━━━━━━━━━━━\n${lines.join('\n')}\n\n⏰ ${new Date().toLocaleString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })}`;
}

/** Fires the "never silenced" critical medical alerts. Runs regardless of sleep mode. */
export async function detectCatheterAlerts(input: CatheterInput): Promise<void> {
  if (input.amount < CATHETER_CRITICAL_LOW_ML) {
    await sendTelegram(alertMessage(['🚨 تنبيه حرج: كمية بول منخفضة جداً', `💧 الكمية: ${input.amount} ml`, '⚠️ احتمال احتباس بولي — يُرجى المتابعة']));
  }
  if (input.color === 'دموي') {
    await sendTelegram(alertMessage(['🚨 تنبيه حرج: بول دموي', '⚠️ يُرجى إبلاغ الطبيب فوراً']));
  }
}

export async function detectVitalsAlerts(input: CheckInput): Promise<void> {
  if (typeof input.temp === 'number') {
    if (input.temp >= HIGH_FEVER_C) {
      await sendTelegram(alertMessage(['🚨 حمى عالية', `🌡️ الحرارة: ${input.temp}°`]));
    } else if (input.temp >= FEVER_C) {
      await sendTelegram(alertMessage(['⚠️ حمى', `🌡️ الحرارة: ${input.temp}°`]));
    }
  }
  if (typeof input.spo2 === 'number' && input.spo2 < CRITICAL_SPO2_PCT) {
    await sendTelegram(alertMessage(['🚨 مستوى أكسجين حرج', `🫁 الأكسجين: ${input.spo2}%`]));
  }
  if (typeof input.pulse === 'number' && input.pulse > TACHYCARDIA_BPM) {
    await sendTelegram(alertMessage(['⚠️ تسارع في النبض', `💓 النبض: ${input.pulse} bpm`]));
  }
}
