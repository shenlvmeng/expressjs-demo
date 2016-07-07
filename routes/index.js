var crypto = require("crypto"),
	User = require('../models/user.js'),
	Post = require('../models/post.js');

module.exports = function(app){
	app.get('/', function(req, res){
		Post.read(null, function(err, posts){
			if(err) posts = [];
			res.render('index', {
				title: 'Homepage' ,
				user: req.session.user,
				success: req.flash('success'),
				error: req.flash('error'),
				posts: posts
			});
		});
	});

	app.get('/reg', checkNotLogin);
	app.get('/reg', function(req, res){
		res.render('reg', {
			title: 'Register',
			user: req.session.user,
			success: req.flash('success'),
			error: req.flash('error')
		});
	});

	app.post('/reg', checkNotLogin);
	app.post('/reg', function(req, res){
		var name = req.body.name,
			password = req.body.password,
			repassword = req.body.repassword;
		if(repassword != password){
			req.flash('error', 'Two passwords not matched.')
			return res.redirect('/reg');
		}
		var sha1 = crypto.createHash('sha1');
		password = sha1.update(password).digest('hex');
		User.read(name, function(err, user){
			if(err){
				req.flash('error', err);
				return res.redirect('/reg');
			}
			if(user){
				req.flash('error', 'Username has existed');
				return res.redirect('/reg');
			}
			var newUser = new User({
				name: name,
				password: password,
				email: req.body.email
			});
			newUser.save(function(err, user){
				if(err){
					req.flash('error', err);
					console.log(err);
					return res.redirect('/reg');
				}
				req.session.user = newUser;
				req.flash('success', 'Register successfully!');
				res.redirect('/');
			});
		});
	});

	app.get('/login', checkNotLogin);
	app.get('/login', function(req, res){
		res.render('login', {
			title: 'Login',
			user: req.session.user,
			success: req.flash('success'),
			error: req.flash('error')
		});
	});

	app.post('/login', checkNotLogin);
	app.post('/login', function(req, res){
		var sha1 = crypto.createHash('sha1'),
			password = sha1.update(req.body.password).digest('hex');
		User.read(req.body.name, function(err, user){
			if(err || !user){
				req.flash('error', 'Username not existed!');
				return res.redirect('/login');
			}
			if(user.password != password){
				req.flash('error', 'Wrong password!');
				return res.redirect('/login');
			}
			req.session.user = user;
			req.flash('success', 'Login successfully!');
			res.redirect('/');
		});
	});

	app.get('/post', checkLogin);
	app.get('/post', function(req, res){
		res.render('post', {
			title: 'Post',
			user: req.session.user,
			success: req.flash('success'),
			error: req.flash('error')
		});
	});

	app.post('/post', checkLogin);
	app.post('/post', function(req, res){
		var user = req.session.user,
			post = new Post(user.name, req.body.title, req.body.content);
		post.save(function(err){
			if(err){
				req.flash('error', err);
				return res.redirect('/');
			}
			req.flash('success', 'Post successfully!');
			res.redirect('/');
		})
	});

	app.get('/logout', checkLogin);
	app.get('/logout', function(req, res){
		req.session.user = null;
		req.flash('success', 'Logout successfully!');
		res.redirect('/');
	});

	function checkLogin(req, res, next){
		if(!req.session.user){
			req.flash('error', 'Please login first!');
			res.redirect('/login');
		}
		next();
	}

	function checkNotLogin(req, res, next){
		if(req.session.user){
			req.flash('error', 'You have logged in!');
			res.redirect('back');
		}
		next();
	}
};