package test_scripts

import "fmt"

func Main_2() {
	nested_func()

	fmt.Println("unreach")
}

func nested_func() {
	panic("ups")
}
