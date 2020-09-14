package main

import (
	"encoding/json"
	"fmt"
	"github.com/containous/yaegi/interp"
	"github.com/containous/yaegi/stdlib"
	"github.com/containous/yaegi/stdlib/unsafe"
	"github.com/containous/yaegi/stdlib/syscall"
	"github.com/tidwall/gjson"
	"github.com/zealic/go2node"
	"os"
)

func main() {

	channel, err := go2node.RunAsNodeChild()
	if err != nil {

		panic(err)
	}
	i := interp.New(interp.Options{GoPath: os.Getenv("GOPATH")})

	i.Use(stdlib.Symbols)
	i.Use(unsafe.Symbols)
	i.Use(syscall.Symbols)

	_, err = i.Eval(`import "fmt"`)
	if err != nil {

		panic(err)
	}

	err = channel.Write(&go2node.NodeMessage{
		Message: []byte(`{}`),
	})
	if err != nil {

		panic(err)
	}
	for {

		msg, err := channel.Read()


		if err != nil {
			panic(err)
		}
		// Declared an empty map interface
		message := gjson.Parse(string(msg.Message))
		// Unmarshal or Decode the JSON to the interface.


		if message.Get("event").String() == "runInContext" {
			resultValue, err := i.Eval(message.Get("body.code").String())


			var result string
			if err != nil {
								result = err.Error()
			} else {
				result = fmt.Sprint(resultValue)
			}


			jsonData, err := json.Marshal(map[string]interface{}{"event": "runResult", "body": map[string]interface{}{"result": result}})

			if err != nil {
				panic(err)
			}


			err = channel.Write(&go2node.NodeMessage{
				Message: jsonData,
			})
			if err != nil {
				panic(err)
			}
		}
	}
}
