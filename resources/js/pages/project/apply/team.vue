<template>
  <form @submit.prevent="login" @keydown="form.onKeydown($event)">
    <div class="">
      <!-- Expertise Role -->
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          How many people are you?
        </h4>
        <div class="form-group__input-container">
          <select v-model="form.person" class="form-group__input-select"
                  placeholder="Select Expertise..." @change="checkMany"
          >
            <option value="2">
              2 Person
            </option>
            <option value="3">
              3 Person
            </option>
          </select>
        </div>
      </div>

      <div v-for="person in copyExpertises" :key="person.id">
        <!-- Expertise Role -->
        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Expertise Role {{ person.who }}
          </h4>
          <div class="form-group__input-container">
            <select v-model="form.slot[person.id].expertise" class="form-group__input-select"
                    placeholder="Select Expertise..."
            >
              <option value="UI/UX Designer">
                UI / UX Designer
              </option>
              <option value="Frontend Engineer">
                Frontend Engineer
              </option>
              <option value="Backend Engineer">
                Backend Engineer
              </option>
              <option value="Data Expert">
                Data Expert
              </option>
            </select>
          </div>
        </div>

        <div class="form-group__container">
          <h4 class="form-group__input-name">
            Tag Name {{ person.who }}
          </h4>
          <div class="form-group__input-container">
            <input v-model="form.slot[person.id].tagname" class="form-group__input-text" value="@ivqonsanada">
          </div>
        </div>
      </div>

      <hr class="form--hr">

      <!-- Tell me about yourself! -->
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Tell me about yourself!
        </h4>
        <div class="form-group__input-container">
          <textarea v-model="form.message" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <!-- Why you ? -->
      <div class="form-group__container">
        <h4 class="form-group__input-name">
          Why the team interested in joining this project?
        </h4>
        <div class="form-group__input-container">
          <textarea v-model="form.interest" class="form-group__input-textarea" placeholder="Max. 300 words" rows="5" />
        </div>
      </div>

      <div class="">
        <!-- Submit Button -->
        <v-button :loading="form.busy" class="form__submit-button">
          Submit
          <span class="iconify" data-icon="si-glyph:paper-plane" data-inline="true" />
        </v-button>
      </div>
    </div>
  </form>
</template>

<script>
import Form from 'vform'

export default {
  middleware: 'auth',

  data: () => ({
    copyExpertises: [],
    expertises: [
      { id: 0, who: 'Team Leader' },
      { id: 1, who: 'Member 1' },
      { id: 2, who: 'Member 2' }
    ],
    form: new Form({
      applicant: 'Team',
      person: '3',
      slot: [
        { expertise: 'UI/UX Designer', tagname: '@ivqonsanada' },
        { expertise: 'Frontend Engineer', tagname: '@verrel' },
        { expertise: 'Data Expert', tagname: '@aji' }
      ],
      description: '',
      interest: ''
    })
  }),

  metaInfo () {
    return { title: 'Apply' }
  },

  mounted () {
    this.checkMany()
  },

  methods: {
    async update () {
      await this.form.post('/api/project/')

      this.form.reset()
    },
    checkMany () {
      this.copyExpertises = []
      for (let i = 0; i < this.form.person; i++) {
        this.copyExpertises.push(this.expertises[i])
      }
    }
  }
}
</script>
