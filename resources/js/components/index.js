import Vue from 'vue'
import Modal from './Modal'
import Child from './Child'
import Button from './Button'
import Icon from './Icon'
import BubbleSkill from './BubbleSkill'
import TopImage from './TopImage.vue'
import { HasError } from 'vform'

// Components that are registered globaly.
[
  Child,
  Modal,
  Button,
  Icon,
  HasError,
  BubbleSkill,
  TopImage
].forEach(Component => {
  Vue.component(Component.name, Component)
})
