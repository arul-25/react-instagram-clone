import {useEffect, useState} from "react"
import "./App.css"
import Post from "./Post"
import {db, auth} from "./firebase"
import {makeStyles} from "@material-ui/core/styles"
import Modal from "@material-ui/core/Modal"
import {Button, Input} from "@material-ui/core"
import ImageUploads from "./ImageUploads"
import InstagramEmbed from "react-instagram-embed"

function rand() {
	return Math.round(Math.random() * 20) - 10
}

function getModalStyle() {
	const top = 50 + rand()
	const left = 50 + rand()

	return {
		top: `${top}%`,
		left: `${left}%`,
		transform: `translate(-${top}%, -${left}%)`
	}
}

const useStyles = makeStyles(theme => ({
	paper: {
		position: "absolute",
		width: 400,
		backgroundColor: theme.palette.background.paper,
		border: "2px solid #000",
		boxShadow: theme.shadows[5],
		padding: theme.spacing(2, 4, 3)
	}
}))

function App() {
	const [posts, setPosts] = useState([])
	const [open, setOpen] = useState(false)
	const [modalStyle] = useState(getModalStyle)
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [username, setUsername] = useState("")
	const [user, setUser] = useState(null)
	const [openSingIn, setOpenSingIn] = useState(false)

	const classes = useStyles()

	useEffect(() => {
		const unsubscribe = auth.onAuthStateChanged(authUser => {
			authUser ? setUser(authUser) : setUser(null)
		})

		return () => {
			// perfome some cleanup actions
			unsubscribe()
		}
	}, [user, username])

	useEffect(() => {
		db.collection("posts")
			.orderBy("timestamp", "desc")
			.onSnapshot(snapshot => {
				setPosts(
					snapshot.docs.map(doc => ({
						id: doc.id,
						post: doc.data()
					}))
				)
			})
	}, [])

	const singUp = e => {
		e.preventDefault()

		auth
			.createUserWithEmailAndPassword(email, password)
			.then(authUser => {
				return authUser.user.updateProfile({
					displayName: username
				})
			})
			.catch(error => alert(error.message))

		setOpen(false)

		setUsername("")
		setEmail("")
		setPassword("")
	}

	const singIn = e => {
		e.preventDefault()
		auth.signInWithEmailAndPassword(email, password).catch(error => alert(error.message))

		setOpenSingIn(false)
		setEmail("")
		setPassword("")
	}

	return (
		<div className="app">
			<Modal open={open} onClose={() => setOpen(false)}>
				<div style={modalStyle} className={classes.paper}>
					<form className="app__singup" onSubmit={singUp}>
						<center>
							<img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" className="app__headerImage" alt="Instagram Logo" />
						</center>

						<Input placeholder="Username" text="text" value={username} onChange={e => setUsername(e.target.value)} />
						<Input placeholder="Email" text="text" value={email} onChange={e => setEmail(e.target.value)} />
						<Input placeholder="Password" text="password" value={password} onChange={e => setPassword(e.target.value)} />

						<Button type="submit" onClick={singUp}>
							Sing UP
						</Button>
					</form>
				</div>
			</Modal>

			<Modal open={openSingIn} onClose={() => setOpenSingIn(false)}>
				<div style={modalStyle} className={classes.paper}>
					<form className="app__singup" onSubmit={singUp}>
						<center>
							<img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" className="app__headerImage" alt="Instagram Logo" />
						</center>

						<Input placeholder="Email" text="text" value={email} onChange={e => setEmail(e.target.value)} />
						<Input placeholder="Password" text="password" value={password} onChange={e => setPassword(e.target.value)} />

						<Button type="submit" onClick={singIn}>
							Sing In
						</Button>
					</form>
				</div>
			</Modal>

			<div className="app__header">
				<img src="https://www.instagram.com/static/images/web/mobile_nav_type_logo.png/735145cfe0a4.png" className="app__headerImage" alt="Instagram Logo" />

				{user ? (
					<Button onClick={() => auth.signOut()}>Logout</Button>
				) : (
					<div className="app__loginContainer">
						<Button onClick={() => setOpenSingIn(true)}>Sign In</Button>
						<Button onClick={() => setOpen(true)}>Sign Up</Button>
					</div>
				)}
			</div>

			<div className="app__posts">
				<div className="app__postsLeft">
					{posts.map(({id, post}) => (
						<Post postId={id} user={user} key={id} {...post} />
					))}
				</div>

				<div className="app__postsRight">
					<InstagramEmbed url="hhttps://www.instagram.com/p/CT6W0B7lIxQ/" maxWidth={320} hideCaption={false} containerTagName="div" protocol="" injectScript onLoading={() => {}} onSuccess={() => {}} onAfterRender={() => {}} onFailure={() => {}} />
				</div>
			</div>

			{user?.displayName ? <ImageUploads username={user.displayName} /> : <h3>Sorry you need to login to upload</h3>}
		</div>
	)
}

export default App
