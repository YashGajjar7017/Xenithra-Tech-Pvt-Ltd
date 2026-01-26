//*************** */ Language selector Code:*********************
let LangData = localStorage.getItem('lang')

function LangSelector() {
  // ---------------C-------------
  var lang = document.getElementById('lang').value

  if (lang == 'C') {
    localStorage.setItem('lang', 'C')
    localStorage.setItem('editorChange', 1)

    document.getElementById('lineCounter').style.height = '62vh'
    document.getElementById('source').style.height = '62vh'

    $('#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,.kali,.futureWork,.encrypt').fadeOut(
      900
    )
    $('#lineCounter,#terminal,#source').delay(700).fadeIn()
    document.getElementById('source').innerHTML = `#include<stdio.h>
void main()
{
    printf("Hello world...");
}`
  }

  // ---------------cpp---------------
  else if (lang == 'C++') {
    $('#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,.kali,.futureWork,.encrypt').fadeOut(
      900
    )
    $('#lineCounter,#terminal,#source').delay(700).fadeIn()
    localStorage.setItem('lang', 'Cpp')
    localStorage.setItem('editorChange', 2)
    document.getElementById('lineCounter').style.height = '62vh'
    document.getElementById('source').style.height = '62vh'

    document.getElementById('source').innerHTML = `#include <iostream>
using namespace std;

int main()
{
    cout << "Hello World";
    return 0;
}`
  }

  // ---------------python---------------
  else if (lang == 'Python') {
    $('#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,.kali,.futureWork,.encrypt').fadeOut(
      900
    )
    $('#lineCounter,#terminal,#source').delay(700).fadeIn()

    localStorage.setItem('lang', 'Python')
    localStorage.setItem('editorChange', 3)

    document.getElementById('lineCounter').style.height = '62vh'
    document.getElementById('source').style.height = '62vh'

    document.getElementById('source').innerHTML = `print("hello world")`
  }

  // ---------------java---------------
  else if (lang == 'Java') {
    $('#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,.kali,.futureWork,.encrypt').fadeOut(
      900
    )
    $('#lineCounter,#terminal,#source').delay(700).fadeIn()

    localStorage.setItem('lang', 'Java')
    localStorage.setItem('editorChange', 4)

    document.getElementById('lineCounter').style.height = '62vh'
    document.getElementById('source').style.height = '62vh'

    document.getElementById('source').innerHTML = `public class Main
{
    public static void main(String[] args)
    {
        System.out.println("Hello World");
    }
}`
  }

  // ---------------html---------------
  else if (lang == 'Html') {
    $('#lineCounter,#IO,#source,.futureWork,.encrypt,.kali').fadeOut(900)
    $('#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1').delay(700).fadeIn() //#lineCounter

    localStorage.setItem('lang', 'Html')
    localStorage.setItem('editorChange', 4)
  }
  // ---------------hacking---------------
  else if (lang == 'Hacking') {
    $(
      '#lineCounter,#IO,#source,#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,.futureWork,.encrypt'
    ).fadeOut(900)
    $('.kali').delay(700).fadeIn()

    localStorage.setItem('lang', 'Hacking')
    localStorage.setItem('editorChange', 5)

    setTimeout((window.location.href = '/404'), 2000)
  }
  // ---------------VB---------------
  else if (lang == 'VB') {
    $('#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,.encrypt,.kali,.futureWork').fadeOut(
      900
    )
    $('#lineCounter,#source,#terminal').delay(700).fadeIn() //#lineCounter

    localStorage.setItem('lang', 'Vb')
    localStorage.setItem('editorChange', 6)

    document.getElementById('source').innerHTML = `Imports System
Public Class Rectangle
Private length As Double
Private width As Double

'Public methods
------------------------------------------------------------------------------------------------------------------------
    Public Sub AcceptDetails()
        length = 4.5
        width = 3.5
    End Sub
------------------------------------------------------------------------------------------------------------------------
    Public Function GetArea() As Double
        GetArea = length * width
    End Function
------------------------------------------------------------------------------------------------------------------------
    Public Sub Display()
        Console.WriteLine("Length: {0}", length)
        Console.WriteLine("Width: {0}", width)
        Console.WriteLine("Area: {0}", GetArea())
    End Sub
------------------------------------------------------------------------------------------------------------------------
    Shared Sub Main()
        Dim r As New Rectangle()
        r.Acceptdetails()
        r.Display()
        Console.ReadLine()
    End Sub
------------------------------------------------------------------------------------------------------------------------
End Class`
  }
  // ---------------Node---------------
  else if (lang == 'Node') {
    $(
      '#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,#lineCounter,#IO,#source,.encrypt,.kali'
    ).fadeOut(900)
    $('.futureWork').delay(700).fadeIn() //#lineCounter

    localStorage.setItem('lang', 'Node')
    localStorage.setItem('editorChange', 7)
    document.getElementsByClassName('run').disabled = true
  }
  // ---------------text---------------
  else if (lang == 'Text') {
    $(
      '#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,#IO,#source.futureWork,.encrypt,.kali'
    ).fadeOut(900)
    $('#lineCounter,#source').delay(700).fadeIn() //#lineCounter

    localStorage.setItem('lang', 'textMode')
    localStorage.setItem('editorChange', 8)

    document.getElementsByClassName('run').disabled = true
    document.getElementById('lineCounter').style.height = '83vh'
    document.getElementById('source').style.height = '83vh'

    document.getElementById('source').innerHTML = `Start your code`
  }
  // --------------Encrypt-----------------
  else if (lang == 'Encrypt') {
    $(
      '#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,#lineCounter,#IO,#source,.futureWork,.kali'
    ).fadeOut(900)
    $('.encrypt').delay(700).fadeIn() //#lineCounter

    localStorage.setItem('lang', 'encrypt')
    localStorage.setItem('editorChange', 9)
  }
  // -------------Applet--------------------
  else if (lang == 'Applet') {
    $(
      '#htmlEditor,#htmlTextarea,#htmlTextarea1,#lineCounter1,#lineCounter,#IO,#source,.encrypt,.kali'
    ).fadeOut(900)
    $('.futureWork').delay(700).fadeIn() //#lineCounter

    localStorage.setItem('lang', 'Applet')
    localStorage.setItem('editorChange', 10)
    document.getElementsByClassName('run').disabled = true
  } else {
    localStorage.removeItem('lang')
    localStorage.setItem('editorChange', 0)
  }
}

// ------------------------Download_File_Code:-----------------------

const downloadFile = () => {
  const link = document.createElement('a')
  const content = document.querySelector('#source').value
  const file = new Blob([content], { type: 'text/plain' })

  link.href = URL.createObjectURL(file)
  a = document.getElementById('lang').value

  if (a == 'C') {
    b = 'c'
  } else if (a == 'C++') {
    b = 'cpp'
  } else if (a == 'Python') {
    b = 'py'
  } else if (a == 'Java' || a == 'Applet') {
    b = 'java'
  } else if (a == 'Html') {
    let text = prompt('HTML → html, CSS → css, JS → js')
    if ((text == 'html') | (text == 'HTML')) {
      b = 'html'
    } else if ((text == 'css') | (text == 'CSS')) {
      b = 'css'
    } else if ((text == 'js') | (text == 'JS')) {
      b = 'js'
    } else {
      alert('wrong extension type')
    }
    // b = 'html';
  } else if (a == 'VB') {
    alert('Coming Soon...')
  } else if (a == 'Node') {
    alert('Coming Soon...')
  } else if (a == 'Encrypt') {
    b = 'sha256'
  } else if (a == 'Text') {
    confirm('warning : all the text is save to server')
    b = 'txt'
  } else {
    // b = 'bat';
    alert('Please select the language first or languague may not be supported for download..')
  }

  link.download = "The_Byter's_Machine." + b
  link.click()

  URL.revokeObjectURL(link.href)
}

// ------------------Full Scream Mode -----------------

function enterFullScreen(element) {
  if (element.requestFullscreen) {
    element.requestFullscreen()
  } else if (element.mozRequestFullScreen) {
    element.mozRequestFullScreen() // Firefox
  } else if (element.webkitRequestFullscreen) {
    element.webkitRequestFullscreen() // Safari
  } else if (element.msRequestFullscreen) {
    element.msRequestFullscreen() // IE/Edge
  }
}

document.addEventListener('fullscreenchange', (event) => {
  if (document.fullscreenElement) {
    console.log('Entered fullscreen:', document.fullscreenElement)
  } else {
    console.log('Exited fullscreen.')
  }
})

// -----------------------Font-size----------------------

function setSize(size) {
  if (size == 12) {
    textarea.style.fontSize = '12px'
    lineTextarea.style.fontSize = '12px'
  } else if (size == 14) {
    textarea.style.fontSize = '14px'
    lineTextarea.style.fontSize = '14px'
  } else if (size == 16) {
    textarea.style.fontSize = '16px'
    lineTextarea.style.fontSize = '16px'
  } else if (size == 18) {
    textarea.style.fontSize = '18px'
    lineTextarea.style.fontSize = '18px'
  } else if (size == 20) {
    textarea.style.fontSize = '20px'
    lineTextarea.style.fontSize = '20px'
  } else if (size == 22) {
    textarea.style.fontSize = '22px'
    lineTextarea.style.fontSize = '22px'
  } else {
    textarea.style.fontSize = '16px'
    lineTextarea.style.fontSize = '16px'
  }
}

let textarea = document.getElementById('source')
let lineTextarea = document.getElementById('lineCounter')
let size = document.getElementById('fontsize')

size.addEventListener('change', function () {
  let size = document.getElementById('fontsize').value
  setSize(size)
})
// textarea.style.fontSize = `${size}px`;
