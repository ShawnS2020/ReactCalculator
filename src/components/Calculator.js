import { useState } from 'react';

export default function Calculator() {

	const [screen, setScreen] = useState("");

	function update(val) {
		setScreen(screen + val);
	}

	function clear() {
		setScreen("");
	}

	function inputOperator(val) {
		const lastEl = screen[screen.length - 1];
		if(screen != "" && screen != "." && lastEl != "+" && lastEl != "-" && lastEl != "\u00D7" && lastEl != "/") {
			update(val);
		}
	}

	function backspace() {
		const screenArr = Array.from(screen);
		screenArr.pop();
		setScreen(screenArr.join(""));
	}

	function inputDecimal() {
		// Last character on the screen
		var lastEl = screen[screen.length - 1];
		const lastOperand = getPrevOperand(screen.length, screen);

		// Check if last element is not a decimal
		if (lastEl != ".") {

			// Check if the last operand already contains a decimal
			// Will only accept input if false
			var isDecimal = false;
			for (let i = 0; i < lastOperand.op.length; i ++) {
				if (lastOperand.op[i] == ".") {
					isDecimal = true;
					i = lastOperand.op.length;
				}
			}
																						if (isDecimal == false) {
				update(".");
			}
		}
	}

	function equal() {
		// Check if last element on screen is a number
		// Don't parse screen if it is... user input is not valid
		const lastEl = screen[screen.length - 1];
		var isValid = false;
		const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		for (let i = 0; i < nums.length; i ++) {
			if (lastEl == nums[i]) {
				isValid = true;
			}
		}
		if (isValid == true) {
			parse(screen);
		}
	}

	function parse(prevScreen) {
		// var screen is a new variable, not the current state
		var screen = prevScreen;
		// PEMDAS
		screen = multiply(screen);
		screen = divide(screen);
		screen = add(screen);
		screen = subtract(screen);
		if (screen == "Infinity" || screen == "NaN") {
			setScreen("Error");
		}
	}

	// Operations
	// The next four functions operate by iterating through the screen and finding the first instance of a certain operator
	// Then math is performed on the operand immediately before and after that operator
	// The functions are recursive

	function multiply(prevScreen) {
		// var screen is a new variable, not the current state
		var screen = prevScreen;
		for (let i = 0; i < screen.length; i ++) {
			if (screen[i] == "\u00D7") {
				const prevOperand = getPrevOperand(i, screen);
				const nextOperand = getNextOperand(i, screen);
				var newScreen = "";

				for (let i = 0; i < prevOperand.startIndex; i ++) {
						newScreen = newScreen + screen[i];
				}
				newScreen = newScreen + (Math.round((+prevOperand.op * +nextOperand.op) * 100000) / 100000);
				for (let i = nextOperand.endIndex + 1; i < screen.length; i ++) {
						newScreen = newScreen + screen[i];
				}
				i = screen.length;
				setScreen(newScreen);
				screen = multiply(newScreen);
			}
		}
		return screen;
	}

	function divide(prevScreen) {
		// var screen is a new variable, not the current state
		var screen = prevScreen;
		for (let i = 0; i < screen.length; i ++) {
			if (screen[i] == "/") {
				const prevOperand = getPrevOperand(i, screen);
				const nextOperand = getNextOperand(i, screen);
				var newScreen = "";

				for (let i = 0; i < prevOperand.startIndex; i ++) {
						newScreen = newScreen + screen[i];
				}
				newScreen = newScreen + (Math.round((+prevOperand.op / +nextOperand.op) * 100000) / 100000);
				for (let i = nextOperand.endIndex + 1; i < screen.length; i ++) {
						newScreen = newScreen + screen[i];
				}
				i = screen.length;
				setScreen(newScreen);
				screen = divide(newScreen);
			}
		}
		return screen;
	}

	function add(prevScreen) {
		// var screen is a new variable, not the current state
		var screen = prevScreen;
		for (let i = 0; i < screen.length; i ++) {
			if (screen[i] == "+") {
				const prevOperand = getPrevOperand(i, screen);
				const nextOperand = getNextOperand(i, screen);
				var newScreen = "";

				for (let i = 0; i < prevOperand.startIndex; i ++) {
						newScreen = newScreen + screen[i];
				}
				newScreen = newScreen + (Math.round((+prevOperand.op + +nextOperand.op) * 100000) / 100000);
				for (let i = nextOperand.endIndex + 1; i < screen.length; i ++) {
						newScreen = newScreen + screen[i];
				}
				i = screen.length;
				setScreen(newScreen);
				screen = add(newScreen);
			}
		}
		return screen;
	}

	function subtract(prevScreen) {
		// var screen is a new variable, not the current state
		var screen = prevScreen;
		for (let i = 1; i < screen.length; i ++) {
			if (screen[i] == "-") {
				const prevOperand = getPrevOperand(i, screen);
				const nextOperand = getNextOperand(i, screen);
				var newScreen = "";

				for (let i = 0; i < prevOperand.startIndex; i ++) {
						newScreen = newScreen + screen[i];
				}
				newScreen = newScreen + (Math.round((+prevOperand.op - +nextOperand.op) * 100000) / 100000);
				for (let i = nextOperand.endIndex + 1; i < screen.length; i ++) {
						newScreen = newScreen + screen[i];
				}
				i = screen.length;
				setScreen(newScreen);
				screen = subtract(newScreen);
			}
		}
		return screen;
	}

	// This function gets the operand after a certain index
	// The index that gets passed should always be an operator
	function getNextOperand(index, prevScreen) {
		// const screen is a new variable, not the current state
		const screen = prevScreen;
		// Index to track the end of the next operand
		var end = index + 1;
		// Define empty string for next operand
		var operand = "";

		// Logic that checks every input and finds where the last operand starts by locating the most recent input that doesn't match array nums
		for(let i = end; i <= screen.length; i ++) {
			if (screen[i] == "+" || screen[i] == "-" || screen[i] == "\u00D7" || screen[i] == "/" || screen[i] == undefined) {
				// Found an operand or end of string
				// Decrement back to last digit in operand
				end --;
				// Break out of loop
				i = screen.length;
			} else {
				end ++;
			}
		}

		// Populate operand string
		for (let i = index + 1; i <= end; i ++) {
			operand = operand + screen[i];
		}

		const operandObj = {
			op: operand,
			startIndex: index + 1,
			endIndex: end
		};

		return operandObj;
	}

	// This function gets the operand before a certain index
	// The index that gets passed should always be an operator or a decimal point
	function getPrevOperand(index, prevScreen) {
		// const screen is a new variable, not the current state
		const screen = prevScreen;
		// Index to track the start of the previous operand
		var start = index - 1;
		// Define empty string for previous operand
		var operand = "";
		// An array that will be used to check each element of the user input to find where the last operand starts
		const nums = [".", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

		// Logic that checks every input and finds where the last operand starts by locating the most recent input that doesn't match array nums
		for(let i = start; i >= -1; i --) {
			if (screen[i] == "+" || screen[i] == "-" || screen[i] == "\u00D7" || screen[i] == "/" || screen[i] == undefined) {
				// Found an operator or start of string
				// Increment back to first digit in operand
				start ++;
				i = -1;
			} else {
				start --;
			}
		}

		// Populate operand string
		for (let i = start; i < index; i ++) {
			operand = operand + screen[i];
		}

		const operandObj = {
			op: operand,
			startIndex: start,
			endIndex: index - 1
		};

		return operandObj;
	}

	return (
		<div className="calculator">
			<input type="text" id="screen" className="calculator-screen" value={screen} disabled />
			<div className="calculator-keys">
				<Button	className={"operator"} func={() => inputOperator("+")} value={"+"} />
				<Button	className={"operator"} func={() => inputOperator("-")} value={"-"} />
				<Button	className={"operator"} func={() => inputOperator("\u00D7")} value={"\u00D7"} />
				<Button	className={"operator"} func={() => inputOperator("/")} value={"/"} />

				<NumBtn func={() => update(7)} value={"7"} />
				<NumBtn func={() => update(8)} value={"8"} />
				<NumBtn func={() => update(9)} value={"9"} />
				<Button	id={"backspace"} func={backspace} value={"\u2190"} />
				<NumBtn func={() => update(4)} value={"4"} />
				<NumBtn func={() => update(5)} value={"5"} />
				<NumBtn func={() => update(6)} value={"6"} />
				<NumBtn func={() => update(1)} value={"1"} />
				<NumBtn func={() => update(2)} value={"2"} />
				<NumBtn func={() => update(3)} value={"3"} />
				<Button	className={"clear"} id={"clear"} func={clear} value={"C"} />
				<NumBtn func={() => update(0)} value={"0"} />
				<Button	className={"decimal"} id={"decimal"} func={inputDecimal} value={"."} />
				<Button	className={"equal"} func={equal} id={"equal"} value={"="} />
			</div>
		</div>
	);
}

function NumBtn(props) {
	return (
		<button type="button" className="number" onClick={props.func} value={props.value}>{props.value}</button>
	);
}

function Button(props) {
	return (
		<button type="button" className={props.className} id={props.id} onClick={props.func} value={props.value}>{props.value}</button>
	);
}
