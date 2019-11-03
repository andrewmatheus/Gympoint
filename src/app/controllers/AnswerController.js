import * as Yup from 'yup';
import Order from '../schemas/HelpOrders';
import Student from '../models/Student';
import QuestionAnswered from '../jobs/QuestionAnsweredMail';
import Queue from '../../lib/Queue';

class AnswerController {
  async store(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation Fails' });
    }

    const { id } = req.params;
    const unansweredQuestion = await Order.findById(id);

    unansweredQuestion.answer = req.body.answer;
    unansweredQuestion.answer_at = new Date();

    const studentId = unansweredQuestion.student_id;
    await unansweredQuestion.save();

    const student = await Student.findByPk(studentId);
    if (!student) {
      return res.status(400).json({ error: 'Student not found' });
    }

    await Queue.add(QuestionAnswered.key, {
      student,
      unansweredQuestion,
    });

    return res.json(unansweredQuestion);
  }

  async index(req, res) {
    const unansweredQuestion = await Order.find({ answer: null });
    return res.json(unansweredQuestion);
  }
}

export default new AnswerController();
