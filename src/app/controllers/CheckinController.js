import { subDays, addDays } from 'date-fns';
import Sequelize from 'sequelize';
import Checkin from '../models/Checkin';
import Student from '../models/Student';

class CheckinController {
  async store(req, res) {
    const student = await Student.findByPk(req.params.id);
    if (!student) {
      return res.status(400).json({ error: 'Student is not exists.' });
    }

    const studentId = student.id;

    const checkinRegister = await Checkin.findAll({
      where: { student_id: student.id },
      order: ['created_at'],
    });

    const checkinStudent = await Checkin.findOne({
      where: { studentId, created_at: new Date() },
    });

    if (checkinStudent) {
      return res.status(400).json({
        error: 'Student checkin already registered on this date',
      });
    }

    if (checkinRegister) {
      checkinRegister.forEach(async check => {
        const dateCheckin = check.created_at;
        const { Op } = Sequelize;
        const blockStartDate = subDays(new Date(), 7);
        if (!(dateCheckin < blockStartDate)) {
          const limitEndDate = addDays(dateCheckin, 7);
          const checkinBlock = await Checkin.findAll({
            where: {
              created_at: { [Op.gte]: dateCheckin },
              student_id: student.id,
            },
            attributes: [
              [Sequelize.fn('COUNT', Sequelize.col('id'), 'number_checkins')],
            ],
            limit: 5,
            order: ['created_at'],
          });

          if (checkinBlock.number_checkins === 5) {
            res.status(400).json({
              error: `Limit exceeded, allowed date for new chekin is ${limitEndDate}`,
            });
          }
        }
      });
    }

    const chekinFinal = await Checkin.create({
      student_id: student.id,
    });

    return res.json(
      `Chekin successfully performed! Student Credential: ${chekinFinal}`
    );
  }

  async index(req, res) {
    return res.json();
  }
}

export default new CheckinController();
