<template>
  <div class="inplace">
    <div class="arr-panel">
        <div class="arr-list">
          <div
            class="item"
            v-for="item in sortArr"
            :key="item.id"
            :class="item.className"
            :style="{height:(item.value/max*100).toFixed(2) + '%'}"
            ref="item"
          >
            <div
              class="move"
              v-show="item.className.includes('act') || item.className.includes('down')"
              :style="{left:item.left + 'px'}"
            ></div>
          </div>
        </div>
      </div>
      <div class="message" v-show="show">{{ message }}</div>
  </div>
</template>
<script>
export default {
  props:['arr','delay'],
  data(){
    return {
      array:[],
      sortArr:[],
      show:false,
      message:'',
      max:0,
    }
  },
  watch:{
    arr(val){
      this.init(val);
    }
  },
  mounted(){
    this.init(this.arr);
  },
  methods:{
    init(arr){
      this.array = arr.slice();
      this.sortArr = this.wrapArr(arr);
      this.max = Math.max.apply(null,arr);
    },
    async startSort(funcName){
      let sortGenerator = this[funcName](this.array);
      let res = sortGenerator.next(),
        value;
      while (!res.done) {
        value = res.value;
        switch (value[0]) {
          case "active":
            await this.addClassAsync(value[1], "act");
            break;
          case "deactive":
            await this.removeClassAsync(value[1], "act");
            break;
          case "swap":
            await this.swapAnimation(value[1][0], value[1][1]);
            break;
          case "sorted":
            await this.addClassAsync(value[1], "ordered");
            break;
          case "down":
            await this.addClassAsync(value[1], "down");
            break;
          case "up":
            await this.removeClassAsync(value[1], "down");
            break;
          case "shell":
            await this.addClassAsync(value[1], "shell");
            break;
          case "unshell":
            await this.removeClassAsync(value[1], "shell");
            break;
          case "show":
            this.show = true;
            this.message = value[1];
            break;
          case "unshow":
            this.show = false;
            break;
          case "blur":
            await this.addClassAsync(value[1],'blur');
            break;
          case "unblur":
            await this.removeClassAsync(value[1],'blur');
            break;
          case "cur":
            await this.addClassAsync(value[1],'cur');
            break;
          case "uncur":
            await this.removeClassAsync(value[1],'cur');
            break;
        }
        res = sortGenerator.next();
      }
    },    
    // 交换动画
    swapAnimation(i, j) {
      this.addClass([i, j], "act");
      let left1 = this.$refs.item[i].offsetLeft;
      let left2 = this.$refs.item[j].offsetLeft;
      return this.moveLeft(i, j, left2 - left1,Math.max(this.delay,100));
    },
    // 将i,j 位置元素, 向左移动到target 动画
    // i < j
    moveLeft(i, j, target, duration = 300, interval = 30) {
      return new Promise(resolve => {
        let times = Math.floor(duration / interval);
        let delta = target / times;
        if (this.timer) {
          // 清除上次影响
          clearInterval(this.timer);
          this.sortArr.forEach(ele => {
            ele.left = 0;
          });
        }
        this.timer = setInterval(() => {
          let res = this.sortArr[i].left + delta;
          if (res > target) {
            this.sortArr[i].left = target;
            this.sortArr[j].left = -target;
            clearInterval(this.timer);
            setTimeout(() => {
              let tmp = this.sortArr[i].value;
              this.sortArr[i].value = this.sortArr[j].value;
              this.sortArr[j].value = tmp;
              if (this.sortArr[j].className.indexOf("down") !== -1) {
                this.removeClass([j], "down");
                this.addClass([i], "down");
              }
              this.removeClass([i, j], "act");
              this.sortArr[i].left = this.sortArr[j].left = 0;
              resolve();
            }, this.delay);
          } else {
            this.sortArr[i].left = res;
            this.sortArr[j].left = -res;
          }
        }, interval);
      });
    }
  }
}
</script>
<style lang="scss" scoped>
.arr-panel {
  .arr-list {
    list-style: none;
    display: flex;
    align-items: flex-end;
    height: 400px;
  }
  .item {
    width: 40px;
    margin: 0 2px;
    background-color: #add6e6;
    // transition: background-color 0.5s;
    position: relative;
    &.act {
      background-color: transparent !important;
      .move {
        background-color: #0d8000;
      }
    }    
    &.partordered {
      background-color: #e6a233;
    }
    &.blur {
      background-color: #ccc;
    }
    &.ordered {
      background-color: #e24062;
    }
    &.cur{
      background-color: yellowgreen;
    }
    &.down {
      background-color: transparent !important;
      .move {
        bottom: -400px;
        background-color: yellowgreen;
      }
    }
    &.shell {
      background-color: blue;
    }
    .move {
      position: absolute;
      width: 100%;
      height: 100%;
    }
  }
}
.message{
  text-align: center;
  line-height: 50px;
  font-size: 38px;
  font-weight: 700;
  color:#000;
}
</style>