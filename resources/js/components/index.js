import Vue from 'vue'
import Card from './Card'
import Modal from './Modal'
import Child from './Child'
import Button from './Button'
import Checkbox from './Checkbox'
import BubbleSkill from './BubbleSkill'
import { HasError, AlertError, AlertSuccess } from 'vform'

// Components that are registered globaly.
[
  Card,
  Child,
  Modal,
  Button,
  Checkbox,
  HasError,
  AlertError,
  AlertSuccess,
  BubbleSkill
].forEach(Component => {
  Vue.component(Component.name, Component)
})
