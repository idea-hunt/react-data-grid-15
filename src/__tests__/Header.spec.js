const React         = require('react');
const rewire        = require('rewire');
const Header        = rewire('../Header');
const TestUtils     = require('react-addons-test-utils');
const rewireModule  = require('../../test/rewireModule');
const StubComponent = require('../../test/StubComponent');
const helpers       = require('./GridPropHelpers');
import { shallow } from 'enzyme';

describe('Header Unit Tests', () => {
  let header;
  // Configure local letiable replacements for the module.
  let HeaderRowStub = new StubComponent('HeaderRow');

  rewireModule(Header, {
    HeaderRow: HeaderRowStub
  });

  let testProps = {
    columnMetrics: {
      columns: helpers.columns,
      minColumnWidth: 80,
      totalWidth: true,
      width: 2600
    },
    totalWidth: 1000,
    height: 50,
    headerRows: [{height: 50, ref: 'row'}],
    onColumnResize: function() {}
  };

  function shouldRenderDefaultRow() {
    let headerRows = TestUtils.scryRenderedComponentsWithType(header, HeaderRowStub);
    expect(headerRows.length).toEqual(1);
  }

  function shouldSetResizeState() {
    let resizeColIdx = 2;
    let newWidth = 350;
    header = TestUtils.renderIntoDocument(<Header {...testProps}/>);
    let headerRow = TestUtils.findRenderedComponentWithType(header, HeaderRowStub);
    headerRow.props.onColumnResize(helpers.columns[resizeColIdx], newWidth);
    expect(header.state.resizing.column.width).toEqual(newWidth);
    expect(header.state.resizing.column.key).toEqual(helpers.columns[resizeColIdx].key);
  }

  function shouldTriggerOnColumnResize() {
    let resizeColIdx = 1;
    spyOn(testProps, 'onColumnResize');
    header = TestUtils.renderIntoDocument(<Header {...testProps}/>);
    let headerRow = TestUtils.findRenderedComponentWithType(header, HeaderRowStub);
    headerRow.props.onColumnResizeEnd(helpers.columns[resizeColIdx], 200);
    expect(testProps.onColumnResize).toHaveBeenCalled();
    expect(testProps.onColumnResize.calls.mostRecent().args[0]).toEqual(resizeColIdx);
    expect(testProps.onColumnResize.calls.mostRecent().args[1]).toEqual(200);
  }

  beforeEach(() => {
    header = TestUtils.renderIntoDocument(<Header {...testProps}/>);
  });

  it('should create a new instance of Header', () => {
    expect(header).toBeDefined();
  });

  it('should initialize the state correctly', () => {
    expect(header.state.resizing).toEqual(null);
  });

  it('should render a default header row', () => {
    shouldRenderDefaultRow();
  });

  it('header row drag start should set resize column state ', () => {
    shouldSetResizeState();
  });

  it('header row drag end should trigger onColumnResize callback', () => {
    shouldTriggerOnColumnResize();
  });

  describe('When columns are immutable',  () => {
    beforeEach(() => {
      testProps.columnMetrics.columns = new Immutable.List(helpers.columns);
      header = TestUtils.renderIntoDocument(<Header {...testProps}/>);
    });

    it('should render a default header row', () => {
      shouldRenderDefaultRow();
    });

    it('header row drag start should set resize column state ', () => {
      shouldSetResizeState();
    });

    it('header row drag end should trigger onColumnResize callback', () => {
      shouldTriggerOnColumnResize();
    });
  });

  describe('Rendering Header component', () => {
    const renderComponent = (props) => {
      const wrapper = shallow(<Header {...props} />);
      return wrapper;
    };
    let testRequiredProps = {
      columnMetrics: {
        columns: helpers.columns,
        minColumnWidth: 81,
        totalWidth: true,
        width: 2601
      },
      height: 51,
      headerRows: [{height: 51, ref: 'row'}]
    };
    let testAllProps = {
      columnMetrics: {
        columns: helpers.columns,
        minColumnWidth: 80,
        totalWidth: true,
        width: 2600
      },
      totalWidth: 1000,
      height: 50,
      headerRows: [{height: 50, ref: 'row'}],
      sortColumn: 'sortColumnValue',
      sortDirection: 'DESC',
      onSort: jasmine.createSpy(),
      onColumnResize: jasmine.createSpy(),
      onScroll: jasmine.createSpy(),
      draggableHeaderCell: jasmine.createSpy(),
      getValidFilterValues: jasmine.createSpy()
    };
    it('passes classname property', () => {
      const wrapper = renderComponent(testAllProps);
      const headerDiv = wrapper.find('div');
      expect(headerDiv.hasClass('react-grid-Header'));
    });
    it('passes style property', () => {
      const wrapper = renderComponent(testAllProps);
      const headerDiv = wrapper.find('div');
      expect(headerDiv.props().style).toBeDefined();
    });
    it('passes height property', () => {
      const wrapper = renderComponent(testAllProps);
      const headerDiv = wrapper.find('div');
      expect(headerDiv.props().height).toBe(50);
    });
    it('passes onScroll property, if available from props', () => {
      const wrapper = renderComponent(testAllProps);
      const headerDiv = wrapper.find('div');
      expect(headerDiv.props().onScroll).toBe(testAllProps.onScroll);
    });
    it('does not pass onScroll properties if it is not available from props', () => {
      const wrapper = renderComponent(testRequiredProps);
      const headerDiv = wrapper.find('div');
      expect(headerDiv.props().onScroll).toBeUndefined();
    });
    it('does not pass unknown properties to the div', () => {
      const wrapper = renderComponent(testAllProps);
      const headerDiv = wrapper.find('div');
      expect(headerDiv.props().columnMetrics).toBeUndefined();
      expect(headerDiv.props().totalWidth).toBeUndefined();
      expect(headerDiv.props().headerRows).toBeUndefined();
      expect(headerDiv.props().sortColumn).toBeUndefined();
      expect(headerDiv.props().sortDirection).toBeUndefined();
      expect(headerDiv.props().onSort).toBeUndefined();
      expect(headerDiv.props().onColumnResize).toBeUndefined();
      expect(headerDiv.props().draggableHeaderCell).toBeUndefined();
      expect(headerDiv.props().getValidFilterValues).toBeUndefined();
    });
  });
});
