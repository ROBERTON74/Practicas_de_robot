<template>
  <div ref="root" class="card">
    <div class="card-header">
      <h5 class="fw-bold">{{ props.graph.title }}</h5>
    </div>
    <div class="card-body">
      <div class="row">
        <!-- div class="col col-2">
          <input type="range" class="form-range" style="transform: rotate(-90deg)" min="1" max="50" value="5">
        </div -->
        <!-- div class="col col-10" -->
        <div ref="dash" class="dash-root"></div>
        <!-- /div -->
      </div>
      <div class="row">
        <div class="col">
          <input type="range" class="form-range" min="1" max="50" v-model="x_range">
        </div>
      </div>
      <div class="row">
        <div v-for="s in Object.keys(props.graph.signals)" :key="s" class="col">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" :model="props.graph.signals[s].show" :name="s" />
            <label class="form-check-label small" :for="s">
              {{ s }}
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  id: String,
  signals: Object,
  graph: Object
})
const root = ref(null);
const Glyphs = { line: Bokeh.Line, circle: Bokeh.Circle };
const glyph = 'line';
const xaxis_label = 'Tiempo (s)';
const yaxis_label = 'Valor';
let plot = null;
const period = 1000;
let updating = true;
const colors = [
  '#ff0000',
  '#0000ff',
  '#00ffff',
  '#00ff00',
  '#ffff00',
  '#ff00ff',
];
const source = new Bokeh.ColumnDataSource(props.signals);
const x_range = 5;

function createPlot() {
  plot = new Bokeh.Plotting.Figure({
    title: props.graph.title,
    x_range: new Bokeh.Range1d({ start: -5, end: 0 }),
    y_range: new Bokeh.Range1d({ start: -12, end: 12 }),
    sizing_mode: 'stretch_width',
    plot_width: 400,
    plot_height: 400,
    tools: 'save, crosshair, pan, xwheel_zoom, ywheel_zoom, reset',
  });
  plot.toolbar.logo = undefined;
  plot.toolbar_location = 'right';

  let nextColor = 0;
  for (const [signal, info] of Object.entries(props.graph.signals)) {
    addLine(info.x_axis, info.y_axis, {
      line_color: colors[nextColor],
      line_width: 2,
      line_dash: [1, 0],
      glyph: 'line',
    });
    addLine(info.x_axis, info.y_axis, {
      line_color: colors[nextColor],
      line_dash: [1, 0],
      glyph: 'circle',
      size: 4,
    });
    nextColor = (nextColor + 1) % colors.length;
  }
}

function addLine(x, y, style) {
  var options = Object.assign(style);
  options.x = { field: x };
  options.y = { field: y };
  var line = new Glyphs[options.glyph](options);
  plot.add_glyph(line, source);
}

function update() {
  const t = props.signals.time.slice(-1)[0];
  if (t && props.graph.properties.x_auto) {
    plot.x_range.start = t - x_range;
    plot.x_range.end = t;
  }
  source.data = props.signals;
  source.change.emit();
  if (updating) {
    setTimeout(() => update(), period);
  }
}

onMounted(() => {
  createPlot();
  let doc = new Bokeh.Document();
  doc.add_root(plot);
  Bokeh.embed.add_document_standalone(
    doc,
    root.value.querySelector('.dash-root')
  );
  update();
});
</script>
