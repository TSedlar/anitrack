const ROMAN = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
const DECIMAL = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]

const ROMAN_VALIDATOR = /^M*(?:D?C{0,3}|C[MD])(?:L?X{0,3}|X[CL])(?:V?I{0,3}|I[XV])$/
const ROMAN_TOKEN = /[MDLV]|C[MD]?|X[CL]?|I[XV]?/g

export class Roman {
  static romanize (value) {
    if (value <= 0 || value >= 4000) {
      return false
    } else {
      let numeral = ''
      for (let i = 0; i < ROMAN.length; i++) {
        while (value >= DECIMAL[i]) {
          value -= DECIMAL[i]
          numeral += ROMAN[i]
        }
      }
      return numeral
    }
  }

  static deromanize (str) {
    str = str.toUpperCase()
    let num = 0
    let matches = false
    if (!(str && ROMAN_VALIDATOR.test(str))) {
      return false
    }
    while ((matches = ROMAN_TOKEN.exec(str))) {
      num += DECIMAL[ROMAN.indexOf(matches[0])]
    }
    return num
  }
}
