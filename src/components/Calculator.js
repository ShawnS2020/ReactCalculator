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

		// Check if the input is not empty and last element is not a decimal and not an operator
		if (lastEl != ".") {

			// Check if the last operand already contains a decimal
			// Will only accept input in false
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
		const lastIn = screen[screen.length - 1];
		var isValid = false;
		const nums = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
		for (let i = 0; i < nums.length; i ++) {
			if (lastIn == nums[i]) {
				isValid = true;
			}
		}
		if (isValid == true) {
			parse(screen);
		}
	}

	function parse(prevScreen) {
		var screen = prevScreen;
		screen = multiply(screen);
		screen = divide(screen);
		screen = add(screen);
		screen = subtract(screen);
		if (screen == "Infinity" || screen == "NaN") {
			setScreen("Error");
		}
	}

	function multiply(prevScreen) {
		var screen = prevScreen;
		for (let i = 0; i < screen.length; i ++) {
			if (screen[i] == "\u00D7") {
				const prevOperand = getPrevOperand(i, screen);
				const nextOperand = getNextOperand(i, screen);
				var newStr = "";

				for (let i = 0; i < prevOperand.startIndex; i ++) {
						newStr = newStr + screen[i];
				}
				newStr = newStr + (Math.round((+prevOperand.op * +nextOperand.op) * 100000) / 100000);
				for (let i = nextOperand.endIndex + 1; i < screen.length; i ++) {
						newStr = newStr + screen[i];
				}
				i = screen.length;
				screen = newStr;
				setScreen(newStr);
				multiply(newStr);
			}
		}
		return screen;
	}

	function divide(prevScreen) {
		var screen = prevScreen;
		for (let i = 0; i < screen.length; i ++) {
			if (screen[i] == "/") {
				const prevOperand = getPrevOperand(i, screen);
				const nextOperand = getNextOperand(i, screen);
				var newStr = "";

				for (let i = 0; i < prevOperand.startIndex; i ++) {
						newStr = newStr + screen[i];
				}
				newStr = newStr + (Math.round((+prevOperand.op / +nextOperand.op) * 100000) / 100000);
				for (let i = nextOperand.endIndex + 1; i < screen.length; i ++) {
						newStr = newStr + screen[i];
				}
				i = screen.length;
				screen = newStr;
				setScreen(newStr);
				divide(newStr);
			}
		}
		return screen;
	}

	function add(prevScreen) {
		var screen = prevScreen;
		for (let i = 0; i < screen.length; i ++) {
			if (screen[i] == "+") {
				const prevOperand = getPrevOperand(i, screen);
				const nextOperand = getNextOperand(i, screen);
				var newStr = "";

				for (let i = 0; i < prevOperand.startIndex; i ++) {
						newStr = newStr + screen[i];
				}
				newStr = newStr + (Math.round((+prevOperand.op + +nextOperand.op) * 100000) / 100000);
				for (let i = nextOperand.endIndex + 1; i < screen.length; i ++) {
						newStr = newStr + screen[i];
				}
				i = screen.length;
				screen = newStr;
				setScreen(newStr);
				add(newStr);
			}
		}
		return screen;
	}

	function subtract(prevScreen) {
		var screen = prevScreen;
		for (let i = 1; i < screen.length; i ++) {
			if (screen[i] == "-") {
				const prevOperand = getPrevOperand(i, screen);
				const nextOperand = getNextOperand(i, screen);
				var newStr = "";

				for (let i = 0; i < prevOperand.startIndex; i ++) {
						newStr = newStr + screen[i];
				}
				newStr = newStr + (Math.round((+prevOperand.op - +nextOperand.op) * 100000) / 100000);
				for (let i = nextOperand.endIndex + 1; i < screen.length; i ++) {
						newStr = newStr + screen[i];
				}
				i = screen.length;
				screen = newStr;
				setScreen(newStr);
				subtract(newStr);
			}
		}
		return screen;
	}

	function getNextOperand(index, prevScreen) {
		const screen = prevScreen;
		// Index to track the end of the next operand
		var end = index + 1;
		// Define empty string for next operand
		var operand = "";
		// An array that will be used to check each element of the user input to find where the last operand starts
		const nums = [".", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

		// Logic that checks every input and finds where the last operand starts by locating the most recent input that doesn't match array nums
		for(let i = end; i < screen.length; i ++) {
			for(let j = 0; j < nums.length; j ++) {
				if(screen[i] == nums[j]) {
					end ++;
					j = nums.length;
				} else if (j == nums.length - 1 && screen[i] != nums[j]) {
					// Found an operator
					// Decrement back to the end of the operand
					end --;
					i = nums.length;
				}
			}
		}

		// Next operand is the last operand
		// Decrement end index to keep index in bounds of array
		if (end == screen.length) {
			end = screen.length - 1;
		}

		// Populate operand  string
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

	function getPrevOperand(index, prevScreen) {
		const screen = prevScreen;
		// Index to track the start of the previous operand
		var start = index - 1;
		// Define empty string for previous operand
		var operand = "";
		// An array that will be used to check each element of the user input to find where the last operand starts
		const nums = [".", 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

		// Logic that checks every input and finds where the last operand starts by locating the most recent input that doesn't match array nums
		for(let i = start; i > 0; i --) {
			for(let j = 0; j < nums.length; j ++) {
				if(screen[i] == nums[j]) {
					start --;
					j = nums.length;
				} else if (j == nums.length - 1 && screen[i] != nums[j]) {
					// Found an operator
					// Increment back to the start of the operand
					start ++;
					i = 0;
				}
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
