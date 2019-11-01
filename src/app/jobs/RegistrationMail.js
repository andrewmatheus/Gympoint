import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';

import Mail from '../../lib/Mail';

class RegistrationMail {
  get key() {
    return 'RegistrationMail';
  }

  async handle({ data }) {
    const { studentExist, planExist, price, start_date, end_date } = data;

    await Mail.sendMail({
      to: `${studentExist.name}<${studentExist.email}>`,
      subject: 'Matricula GymPoint',
      template: 'registration',
      context: {
        student: studentExist.name,
        namePlan: planExist.title,
        durationPlan: planExist.duration,
        pricePlan: parseFloat(price.toFixed(2)),
        startPlan: format(parseISO(start_date), "'dia' dd 'de' MMM 'de' yyyy", {
          locale: pt,
        }),
        endPlan: format(parseISO(end_date), "'dia' dd 'de' MMM 'de' yyyy", {
          locale: pt,
        }),
      },
    });
  }
}

export default new RegistrationMail();
