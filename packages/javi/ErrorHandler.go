package main

import (
	"fmt"
	"runtime"
)

/**
 *
 * notes
 * 	- debug.PrintStack just calles debug.Stack()
 *  - runtime.Stack contain the same information as debug.Stack()
 * 			But it can return from all go-functions
 *	- pprof.Lookup("goroutine") same as runtime.Stack
 */
func ErrorHandler() {

	if errMessage := recover(); errMessage != nil {
		fmt.Println(errMessage)

		getStack() //We're in the context of the panic, so the stack will represent that position.
	}
}

/**
 *
 */
func getStack() {

	var pc uintptr
	var file string
	var line int
	var ok bool

	for i := 0; i < 10; i++ {

		if pc, file, line, ok = runtime.Caller(i); !ok {
			break
		}

		name := runtime.FuncForPC(pc).Name()

		fmt.Println(name, file, line)
	}
}
