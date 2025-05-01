const supabase = require('../utils/supabaseClient');
const { sendEmail } = require('../services/emailService');

async function signInHandler(req, res) {
  try {
    const { email, name, sub: userId } = req.auth;
    const io = req.app.get('io');

    io.emit('notification', {
      type: 'NEW_USER_SIGNIN',
      message: `New sign-in: ${email}`
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
}

async function updateUserStatusHandler(req, res) {
  try {
    const { userId } = req.params;
    const { role, status } = req.body;
    const io = req.app.get('io');

    const table = role === 'freelancer' ? 'freelancers' : 'clients';
    const { error } = await supabase
      .from(table)
      .update({ status })
      .eq('user_id', userId);

    if (error) throw error;

    io.to(userId).emit('notification', {
      type: 'PROFILE_STATUS',
      message: `Your ${role} profile was ${status}.`
    });

    const { data: users } = await supabase
      .from('users')
      .select('email')
      .eq('id', userId)
      .single();
    const userEmail = users?.email;

    if (userEmail) {
      await sendEmail({
        to: userEmail,
        subject: `Your profile has been ${status}`,
        html: `<p>Hi there,</p>
               <p>Your ${role} profile has been <strong>${status}</strong> by an admin.</p>`
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
}

async function downloadUserProfilePdfHandler(req, res) {
  try {
    const { userId } = req.params;
    const role = req.user.role;
    if (role !== 'admin') return res.status(403).end();

    const table = req.query.type === 'client' ? 'clients' : 'freelancers';
    const { data } = await supabase
      .from(table)
      .select('profile')
      .eq('user_id', userId)
      .single();

    const url = data?.profile?.fileUrls?.cv;
    if (!url) return res.status(404).send('No CV found');

    res.redirect(url);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
}

module.exports = {
  signInHandler,
  updateUserStatusHandler,
  downloadUserProfilePdfHandler
};