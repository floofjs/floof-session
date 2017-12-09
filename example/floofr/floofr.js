const {FloofBall, Floop, redirect} = require('floof');
const SessionPlugin = require('../../index.js');

const app = new FloofBall();
app.config = {username: null, password: null};

const entries = [];
app.context({
  entries,
});

app.plugin(new SessionPlugin('super-secret-code'));

app.before().exec((req) => {
  req.flashes = req.session.flashes || [];
  req.session.flashes = [];
  req.flash = function(s) {
    req.session.flashes.push(s);
  };
});

app.get('/').exec((req, ren) => {
  return ren.render('show_entries.html');
});

app.post('/add').withBody('form').exec(async (req, ren) => {
  if (!req.session.authed) throw new Floop(401);
  const body = await req.body();
  entries.push({
    title: body.title,
    text: body.text,
  });
  req.flash('Meme successfully posted!');
  return redirect('/');
});

app.get('/login').exec((req, ren) => {
  if (req.session.authed) return redirect('/');
  return ren.render('login.html', {error: null});
});

app.post('/login').withBody('form').exec(async (req, ren) => {
  if (req.session.authed) return redirect('/');
  const body = await req.body();
  if (body.username !== app.config.username || body.password !== app.config.password) {
    console.log(body);
    return ren.render('login.html', {error: 'Invalid credentials!'});
  }
  req.session.authed = true;
  req.flash('You were logged in!');
  return redirect('/');
});

app.get('/logout').exec((req, ren) => {
  req.session.authed = false;
  req.flash('You were logged out!');
  return redirect('/');
});

module.exports = app;
