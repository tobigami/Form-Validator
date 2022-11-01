function validator(fromSelector) {

  var that = this
  // function getParentElement
  function getParent(currentElement, containerElement) {
    while (currentElement.parentElement) {
      if (currentElement.parentElement.matches(containerElement)) {
        return currentElement.parentElement
      }
      currentElement = currentElement.parentElement
    }

  }


  // dom element theo fromSelector
  let formElement = document.querySelector(fromSelector)


  // formRules chua tat cac cac rules trong inputs
  let formRules = {}

  /**
   * validatorRules : dinh nghia ra cac rules
   * - khi co loi return message err
   * - khi khong co loi return undefined
   */
  let validatorRules = {
    required(value) {
      return value ? undefined : 'The field is required'
    },
    email(value) {
      let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/g
      return regex.test(value) ? undefined : 'Please enter a valid email address'
    },
    min(min) {
      return function (value) {
        return value.length >= min ? undefined : `The password must be more than ${min} characters long`
      }
    },
    confirm(value) {
      const x = document.querySelector('#password')
      if (value === x.value) {
        return undefined
      } else {
        return 'The field does not match password'
      }
    }

  }

  //  chi su ly khi lay ra dung formElement
  if (formElement) {
    //  lay toan bo cac the input co name va rules
    let inputs = document.body.querySelectorAll("[name],[rules]")
    inputs.forEach((input) => {
      let rules = input.getAttribute('rules').split('|')
      for (var rule of rules) {

        let ruleFunction = validatorRules[rule]
        if (rule.includes(':')) {
          let t = rule.split(':')
          rule = t[0]
          ruleFunction = validatorRules[rule](t[1])
        }

        if (Array.isArray(formRules[input.name])) {
          formRules[input.name].push(ruleFunction)
        } else {
          formRules[input.name] = [ruleFunction]
        }
      }

      // events listener
      input.addEventListener("blur", handleFunction)
      input.oninput = handleClear

    })

    // Handle events
    function handleFunction(e) {
      let errMessage
      let rules = formRules[e.target.name]
      rules.some((rule) => {
        return errMessage = rule(e.target.value)
      })

      if (errMessage) {
        let formGroup = getParent(e.target, '.form-group')
        if (formGroup) {
          formGroup.classList.add('invalid')
          let formMess = formGroup.querySelector('.form-message')
          if (formMess) {
            formMess.innerText = errMessage
          }
        }
      }
      return !errMessage

    }

    function handleClear(e) {
      // console.log(e.target)
      let formGroup = getParent(e.target, '.form-group')
      if (formGroup.classList.contains('invalid')) {
        formGroup.classList.remove('invalid')
        let formMess = formGroup.querySelector('.form-message')
        if (formMess) {
          formMess.innerText = ''
        }
      }

    }

  }

  //handle submit
  let submit = formElement.querySelector('.form-submit')
  if (submit) {
    submit.onclick = function (e) {
      e.preventDefault()
      let inputs = document.body.querySelectorAll("[name],[rules]")
      let isValid = true
      inputs.forEach((input) => {
        handleFunction({ target: input })
        if (!handleFunction({ target: input })) {
          isValid = false
        }
      })

      // khi khong co loi thi submit form
      if (isValid) {
        if (typeof that.onSubmit === "function") {
          var enableInput = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );
          // convert NodeList sang Array
          var data = Array.from(enableInput).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "radio":
                if (input.matches(":checked")) {
                  values[input.name] = input.value;
                }
                break;
              case "checkbox":
                if (!input.matches(":checked")) return values;
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              default:
                values[input.name] = input.value;
            }
            return values;
          },
            {});
          that.onSubmit(data);
        }

      }

    }
  }
}