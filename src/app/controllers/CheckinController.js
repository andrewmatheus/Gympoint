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

    // const studentId = student.id;

    const checkinRegister = await Checkin.findOne({
      where: { student_id: student.id },
      order: ['created_at'],
    });

    if (checkinRegister) {
      console.log(`Estou Aqui 1`);
      checkinRegister.forEach(async check => {
        const dateCheckin = check.created_at;
        const { Op } = Sequelize;
        const blockStartDate = subDays(new Date(), 7);
        if (!(dateCheckin < blockStartDate)) {
          const limitEndDate = addDays(dateCheckin, 7);
          const checkinBlock = await Checkin.findAll({
            where: {
              created_at: { [Op.gte]: blockStartDate },
              student_id: student.id,
            },
            attributes: [
              [Sequelize.fn('COUNT', Sequelize.col('id'), 'number_checkins')],
            ],
            limit: 5,
            order: ['created_at'],
          });

          console.log(`Estou Aqui 2`);
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
      `Chekin successfully performed! Student Credential: ${chekinFinal.student_id}`
    );
  }

  async index(req, res) {
    return res.json();
  }
}

export default new CheckinController();
