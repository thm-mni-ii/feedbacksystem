<template>
  <div>
    <h1>Katalog bearbeiten</h1>
    <div>
        <ul>
            <li v-for="data in courseData" :key="data">
                {{data}}
                <button @click="handleClick(data)">Ändern</button>
            </li>
        </ul>
    </div>
  </div>
</template>

<script>
import catalogService from '@/services/catalog.service';
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import { onMounted } from 'vue';

export default {
    setup() {
        const courseData = ref([]);
        const route = useRoute();
        const id = route.params.id;
        const getCourseData = async () => {
            try {
                const res = await catalogService.getCatalog(id);                 
                console.log(res);
                const course = res.data;
                console.log(course);
                const data = [];
                data.push(course.name);
                data.push("Vorraussetzungen");
                data.push("Fragen");
                courseData.value = data; 
                console.log(courseData);
            } catch (e) {
                console.log(e);
            }
        };
        const handleClick = (data) => {
            console.log(data);
        }
        onMounted(async () => {
          await getCourseData();
        });
        return {
            courseData,
            handleClick
        };
    },
};
</script>
