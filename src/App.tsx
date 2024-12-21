import React, { useRef, useState } from "react"
import "./App.css"
import { createRoot } from "react-dom/client"
import { JSX } from "react/jsx-runtime"

interface WorkerInterface {
	id: number
	worker: JSX.Element
	tasks: JSX.Element[]
	busyness: number
}

interface TaskInterface {
	id: number
	task: JSX.Element
	time: number
}

const App: React.FC = () => {
	const [darkMode, setDarkMode] = useState<boolean>(true)
	const [workerCount, setWorkerCount] = useState<number>(0)
	const [taskCount, setTaskCount] = useState<number>(0)
	const [workerCountError, setWorkerCountError] = useState<string>("")
	const [taskCountError, setTaskCountError] = useState<string>("")
	const workerContainer = useRef<HTMLDivElement>(null)
	const [isRealTime, setIsRealTime] = useState<boolean>(false)

	function isValidInput() {
		let isValid = true
		setWorkerCountError("")
		setTaskCountError("")
		if (isNaN(workerCount)) {
			setWorkerCountError("Worker count must be a number")
			isValid = false
		}
		if (isNaN(taskCount)) {
			setTaskCountError("Task count must be a number")
			isValid = false
		}
		if (workerCount < 4) {
			setWorkerCountError("Worker count must be greater or equal to 4")
			isValid = false
		}
		if (taskCount < 4) {
			setTaskCountError("Task count must be greater or equal to 4")
			isValid = false
		}
		if (workerCount > 20) {
			setWorkerCountError("Worker count must be less than or equal to 20")
			isValid = false
		}
		if (taskCount > 20) {
			setTaskCountError("Task count must be less than or equal to 20")
			isValid = false
		}
		if (taskCount < workerCount) {
			setTaskCountError("Task count must be greater than worker count")
			isValid = false
		}
		return isValid
	}

	function generateWorkers(): WorkerInterface[] {
		const workers = []
		for (let i = 0; i < workerCount; i++) {
			const worker: WorkerInterface = {
				id: i,
				worker: (
					<div className='w-full flex flex-col gap-y-3'>
						<label htmlFor={`worekr-${i}`} className='-mb-2'>
							Worker {i + 1} | Busyness 0
						</label>
						<div
							key={i}
							id={`worekr-${i}`}
							className='w-full border-2 rounded-lg flex gap-x-2 p-2'
						>
							{/* Just a placeholder so it doesn't shift when tasks are added */}
							<div className={`h-8`}></div>
						</div>
					</div>
				),
				tasks: [],
				busyness: 0,
			}
			workers.push(worker)
		}
		return workers
	}

	function generateTasks(workers: WorkerInterface[]): TaskInterface[] {
		const taskTimes: number[] = []
		for (let i = 0; i < taskCount; i++) {
			taskTimes.push(Math.floor(Math.random() * 17) + 4)
		}
		taskTimes.sort((a, b) => a - b)

		const totalTaskTimes = taskTimes.reduce((a, b) => a + b, 0)
		const maxTaskTime = Math.max(...taskTimes)
		const averageTime = totalTaskTimes / (maxTaskTime * 2)
		const factor = workers.length / averageTime

		const taskObjects: TaskInterface[] = []
		for (let i = 0; i < taskTimes.length; i++) {
			const percentage = taskTimes[i] * factor
			const task: TaskInterface = {
				id: i,
				task: (
					<div
						className={`h-8 bg-blue-500 text-white flex justify-center items-center rounded-md`}
						style={{ width: `${percentage}%` }}
					>
						{taskTimes[i]}
					</div>
				),
				time: taskTimes[i],
			}
			taskObjects.push(task)
		}
		return taskObjects
	}

	function getLeastLoadedWorkers(
		workers: WorkerInterface[],
	): WorkerInterface[] {
		let leastLoadedWorkers: WorkerInterface[] = []
		for (let i = 0; i < workers.length; i++) {
			const worker = workers[i]
			if (leastLoadedWorkers.length === 0) {
				leastLoadedWorkers.push(worker)
			} else {
				if (worker.busyness < leastLoadedWorkers[0].busyness) {
					leastLoadedWorkers = [worker]
				} else if (worker.busyness === leastLoadedWorkers[0].busyness) {
					leastLoadedWorkers.push(worker)
				}
			}
		}
		return leastLoadedWorkers
	}

	function updateWorkerElements(
		workers: WorkerInterface[],
		workerElements: JSX.Element[],
	) {
		for (let i = 0; i < workers.length; i++) {
			const worker = workers[i]
			workerElements[worker.id] = (
				<div className='w-full flex flex-col gap-y-3'>
					<label htmlFor={`worekr-${worker.id}`} className='-mb-2'>
						Worker {worker.id + 1} | Busyness {worker.busyness}
					</label>
					<div
						key={worker.id}
						id={`worekr-${worker.id}`}
						className='w-full border-2 rounded-lg flex gap-x-2 p-2'
					>
						{worker.tasks}
					</div>
				</div>
			)
		}
	}

	function drawGrid() {
		if (!workerContainer.current) return
		const workers = generateWorkers()
		const taskObjects = generateTasks(workers)
		const root = createRoot(workerContainer.current)
		const startTime = new Date().getTime()

		setInterval(() => {
			if (!workerContainer.current) return
			if (taskObjects.length === 0) return
			const workerElements = workers.map((worker) => worker.worker)
			const leastLoadedWorkers: WorkerInterface[] =
				getLeastLoadedWorkers(workers)

			for (let i = 0; i < leastLoadedWorkers.length; i++) {
				const worker = leastLoadedWorkers[i]
				if (
					isRealTime &&
					startTime + worker.busyness * 1000 > new Date().getTime()
				) {
					return
				}
				const task = taskObjects.shift()
				if (task) {
					worker.busyness += task.time
					worker.tasks.push(task.task)
				}
			}
			updateWorkerElements(workers, workerElements)
			root.render(<>{workerElements}</>)
		}, 1000)

		root.render(<>{workers.map((worker) => worker.worker)}</>)
	}

	return (
		<div className={`${darkMode ? "dark" : ""}`}>
			<div className='min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100'>
				<header className='p-4 shadow-md flex justify-between items-center'>
					<h1 className='text-2xl font-bold'>Task Scheduler</h1>
					<button
						onClick={() => setDarkMode(!darkMode)}
						className='p-2 bg-gray-300 dark:bg-gray-800 rounded'
					>
						{darkMode ? "Light Mode" : "Dark Mode"}
					</button>
				</header>
				<main className='md:flex-row p-4 gap-y-4 gap-x-4 flex-col flex min-h-[90vh]'>
					<div className='lg:w-[50%] bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-center flex-col items-center'>
						<h2 className='text-lg font-semibold mb-2'>
							Scheduler Input
						</h2>
						<div className='flex flex-col gap-y-2 my-4'>
							<label
								htmlFor='worker-count'
								className='text-lg font-semibold select-none'
							>
								Worker Count
							</label>
							<input
								className='appearance-none p-2 border rounded-md dark:bg-gray-700 border-gray-500 focus:border-blue-500 outline-none w-64'
								type='number'
								id='worker-count'
								onChange={(e) => {
									setWorkerCount(parseInt(e.target.value))
								}}
							/>
							<p className='text-red-600 text-sm -mt-2 ml-1 w-64'>
								{workerCountError}
							</p>

							<label
								htmlFor='destination'
								className='text-lg font-semibold select-none'
							>
								Task Count
							</label>
							<input
								className='appearance-none p-2 border rounded-md dark:bg-gray-700 border-gray-500 focus:border-blue-500 outline-none w-64'
								type='number'
								id='task-count'
								onChange={(e) => {
									setTaskCount(parseInt(e.target.value))
								}}
							/>
							<p className='text-red-600 text-sm -mt-2 ml-1 w-64'>
								{taskCountError}
							</p>
						</div>
						<div className='flex items-center gap-x-2 mb-4'>
							<label
								htmlFor='real-time'
								className='text-lg font-semibold select-none'
							>
								Realtime
							</label>
							<input
								type='checkbox'
								id='real-time'
								className='bg-gray-500 dark:bg-gray-700 accent-blue-500 dark:accent-blue-700 -mb-1'
								onChange={(e) =>
									setIsRealTime(e.target.checked)
								}
								checked={isRealTime}
							/>
						</div>
						<button
							onClick={() => {
								if (isValidInput()) drawGrid()
							}}
							className='px-4 py-2 bg-blue-500 text-white rounded shadow'
						>
							Schedule
						</button>

						<a href='https://github.com/M4hbod/Task-Schedulereact'>
							<button className='flex justify-center items-center rounded bg-gray-100 dark:bg-gray-900 text-center text-gray-900 dark:text-gray-100 mt-4 py-2 px-4'>
								Visit GitHub
							</button>
						</a>
					</div>

					<div
						className='w-full bg-white dark:bg-gray-800 p-4 rounded shadow flex justify-center flex-col items-center space-y-2'
						id='worker-container'
						ref={workerContainer}
					></div>
				</main>
			</div>
		</div>
	)
}

export default App
