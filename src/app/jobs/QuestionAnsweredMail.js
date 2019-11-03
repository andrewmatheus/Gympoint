import Mail from '../../lib/Mail';

class QuestionAnsweredMail {
  get key() {
    return 'QuestionAnsweredMail';
  }

  async handle({ data }) {
    const { student, unansweredQuestion } = data;

    await Mail.sendMail({
      to: `${student.name}<${student.email}>`,
      subject: 'Question Answered',
      template: 'questionAnswered',
      context: {
        student: student.name,
        question: unansweredQuestion.question,
        answer: unansweredQuestion.answer,
      },
    });
  }
}

export default new QuestionAnsweredMail();
